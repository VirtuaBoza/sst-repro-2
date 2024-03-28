import { db, pool, schema, mapToNested } from "@stacks-ils-ion/core/sql";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { Resource } from "sst";

const openai = new OpenAI({
  apiKey: Resource.OpenApiKey.value,
});

const limitedBooks = await db
  .$with("books")
  .as(db.select().from(schema.books).offset(2).limit(2));

const books = await db
  .with(limitedBooks)
  .select()
  .from(limitedBooks)
  .leftJoin(
    schema.bookTopics,
    eq(limitedBooks.itemId, schema.bookTopics.bookId)
  )
  .then((res) =>
    mapToNested(res, [
      "books",
      "itemId",
      {
        topics: ["book_topic", "id"],
      },
    ])
  )
  .then((res) =>
    res.map((book) => ({
      bookId: book.itemId,
      input: `Title: ${book.title} | Summary: ${
        book.summary
      } | Topics: ${book.topics.map((topic) => topic.name).join("; ")}`,
    }))
  );

const embeddings = await openai.embeddings.create({
  input: books.map((book) => book.input),
  model: "text-embedding-3-small",
});

const bookEmbeddings = books.map((book, i) => ({
  ...book,
  embedding: embeddings.data[i].embedding,
}));

for await (const be of bookEmbeddings) {
  await db.transaction(async (db) => {
    const { embeddingId } = await db
      .insert(schema.embeddings)
      .values({
        value: be.embedding,
        input: be.input,
        model: "text-embedding-3-small",
      })
      .returning({ embeddingId: schema.embeddings.id })
      .then((res) => res[0]!);
    await db
      .update(schema.books)
      .set({ embeddingId })
      .where(eq(schema.books.itemId, be.bookId));
  });
}

console.log("Done");

await pool.end();
