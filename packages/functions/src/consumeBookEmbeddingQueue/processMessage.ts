import { BookEmbeddingMessage } from "@stacks-ils-ion/core/models";
import { Resource } from "sst";
import { db, mapToNested, schema } from "@stacks-ils-ion/core/sql";
import { eq, inArray } from "drizzle-orm";
import OpenAI from "openai";

const model = "text-embedding-3-small" as const;
const openai = new OpenAI({
  apiKey: Resource.OpenApiKey.value,
});
const BATCH_SIZE = 100;

export async function processMessage(message: BookEmbeddingMessage) {
  const batches: string[][] = [];
  for (let i = 0; i < message.bookIds.length; i += BATCH_SIZE) {
    batches.push(message.bookIds.slice(i, i + BATCH_SIZE));
  }

  for await (const batch of batches) {
    await processBatch(batch);
  }
}

async function processBatch(bookIds: string[]) {
  const results = await db
    .select()
    .from(schema.books)
    .leftJoin(
      schema.embeddings,
      eq(schema.books.embeddingId, schema.embeddings.id)
    )
    .leftJoin(
      schema.bookTopics,
      eq(schema.books.itemId, schema.bookTopics.bookId)
    )
    .leftJoin(
      schema.bookAuthors,
      eq(schema.books.itemId, schema.bookAuthors.bookId)
    )
    .where(inArray(schema.books.itemId, bookIds))
    .then((res) =>
      mapToNested(res, [
        "book",
        "itemId",
        {
          authors: ["book_author", "id"],
          embedding: "embedding",
          topics: ["book_topic", "id"],
        },
      ])
    );

  const filteredInputs = results.reduce(
    (acc, entry) => {
      const input = getInputForBook(entry);
      if (entry.embedding?.input === input) {
        return acc;
      }
      acc.push({
        bookId: entry.itemId,
        input,
      });
      return acc;
    },
    [] as Array<{
      bookId: string;
      input: string;
    }>
  );

  if (filteredInputs.length === 0) {
    return;
  }

  const embeddings = await openai.embeddings.create({
    input: filteredInputs.map((input) => input.input),
    model,
    user: "consumeBookEmbeddingQueue",
  });

  const bookEmbeddings = filteredInputs.map((input, i) => ({
    ...input,
    embedding: embeddings.data[i].embedding,
  }));

  for await (const be of bookEmbeddings) {
    await db.transaction(async (db) => {
      const { embeddingId } = await db
        .insert(schema.embeddings)
        .values({
          input: be.input,
          model,
          value: be.embedding,
        })
        .returning({ embeddingId: schema.embeddings.id })
        .then((res) => res[0]!);
      await db
        .update(schema.books)
        .set({ embeddingId })
        .where(eq(schema.books.itemId, be.bookId));
    });
  }

  console.log(`Inserted ${bookEmbeddings.length} embeddings.`);
}

function getInputForBook(book: {
  authors: Array<{ name: string }>;
  summary: string | null;
  title: string;
  topics: Array<{ name: string }>;
}) {
  return `Title: ${book.title} | Authors: ${book.authors
    .map((ba) => ba.name)
    .join("; ")} | Summary: ${book.summary || ""} | Topics: ${book.topics
    .map((t) => t.name)
    .join("; ")}`;
}
