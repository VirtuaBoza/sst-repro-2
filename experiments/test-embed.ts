import { db, pool, schema, cosineDistance } from "@stacks-ils-ion/core/sql";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { Resource } from "sst";

const openai = new OpenAI({
  apiKey: Resource.OpenApiKey.value,
});

const input =
  "The Children's Homer: The Adventures of Odysseus and the Tale of Troy";

const embedding = await (async () => {
  const found = await db.query.embeddings.findFirst({
    where: eq(schema.embeddings.input, input),
  });
  if (found) {
    return found.value;
  }
  const value = await openai.embeddings
    .create({
      input,
      model: "text-embedding-3-small",
    })
    .then((res) => res.data[0].embedding);
  return db
    .insert(schema.embeddings)
    .values({
      input,
      value,
      model: "text-embedding-3-small",
    })
    .returning()
    .then((res) => res[0]!.value);
})();

const results = await db
  .select({
    title: schema.books.title,
    summary: schema.books.summary,
    score: cosineDistance(schema.embeddings.value, embedding),
  })
  .from(schema.embeddings)
  .innerJoin(schema.books, eq(schema.books.embeddingId, schema.embeddings.id))
  .where(eq(schema.books.libraryId, "f368ad5d-495f-41ba-9c7d-9c48ff1007c2"))
  .limit(2)
  .orderBy(cosineDistance(schema.embeddings.value, embedding));

console.log(results);

await pool.end();
