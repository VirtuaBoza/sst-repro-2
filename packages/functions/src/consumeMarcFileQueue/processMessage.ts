import {
  BookEmbeddingMessage,
  marcFileMessageSchema,
} from "@stacks-ils-ion/core/models";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Iso2709Parser } from "@stacks-ils-ion/core/marc";
import { ProcessedData } from "./types";
import { Resource } from "sst";
import { SQS } from "@aws-sdk/client-sqs";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@stacks-ils-ion/core/sql";
import { marcFileImports } from "@stacks-ils-ion/core/sql/schema";
import { parseRecord } from "./parseRecord";
import { processBatch } from "./processBatch";
import { z } from "zod";

const S3 = new S3Client({});
const sqs = new SQS({});

const BATCH_SIZE = 500;

export async function processMessage({
  bucketName,
  fileKey,
  importId,
  libraryId,
}: z.infer<typeof marcFileMessageSchema>) {
  try {
    const config = await db
      .update(marcFileImports)
      .set({
        status: "PARSING",
      })
      .where(
        and(
          eq(marcFileImports.id, importId),
          eq(marcFileImports.libraryId, libraryId),
          eq(marcFileImports.status, "PENDING")
        )
      )
      .returning({
        duplicateBarcodeBehavior:
          schema.marcFileImports.duplicateBarcodeBehavior,
        noBarcodeBehavior: schema.marcFileImports.noBarcodeBehavior,
      })
      .then((res) => {
        return res[0];
      });

    if (!config) {
      console.error("No pending config found for import", importId);
      return;
    }

    const fileStream = (
      await readStreamFromS3({
        Bucket: bucketName,
        Key: fileKey,
      })
    ).Body as NodeJS.ReadableStream;

    const barcodes = await db
      .select({ barcode: schema.catalogItemCopies.barcode })
      .from(schema.catalogItemCopies)
      .where(eq(schema.catalogItemCopies.libraryId, libraryId))
      .then((res) =>
        res.reduce((acc, cur) => {
          acc.add(cur.barcode);
          return acc;
        }, new Set<string>())
      );

    const booksByISBN = await db
      .select({
        bookId: schema.bookEditions.bookId,
        editionId: schema.bookEditions.id,
        isbn10: schema.bookEditions.isbn10,
        isbn13: schema.bookEditions.isbn13,
      })
      .from(schema.bookEditions)
      .where(eq(schema.bookEditions.libraryId, libraryId))
      .then((res) => {
        return res.reduce(
          (acc, cur) => {
            const entry = {
              bookId: cur.bookId,
              editionId: cur.editionId,
            };
            if (cur.isbn10) {
              acc.set(cur.isbn10.toUpperCase(), entry);
            }
            if (cur.isbn13) {
              acc.set(cur.isbn13.toUpperCase(), entry);
            }
            return acc;
          },
          new Map<
            string,
            {
              bookId: string;
              editionId: string;
            }
          >()
        );
      });

    const addedBookIds: string[][] = [];

    await db.transaction(async (tx) => {
      const _processBatch = (batch: ProcessedData[]) => {
        return processBatch({
          barcodes,
          batch,
          booksByISBN,
          config,
          importId,
          libraryId,
          tx,
        }).then((res) => {
          addedBookIds.push(res.addedBookIds);
        });
      };

      await new Promise<void>((resolve, reject) => {
        let batch: ProcessedData[] = [];
        let batchIndex = 0;

        const marcStream = fileStream.pipe(new Iso2709Parser());
        marcStream.on("data", (record) => {
          const parsedData = parseRecord(record);
          batch.push(parsedData);
          if (batch.length >= BATCH_SIZE) {
            marcStream.pause();
            const toProcess = [...batch];
            batch = [];
            _processBatch(toProcess)
              .then(() => {
                marcStream.resume();
                console.log(`Processed batch ${++batchIndex}`);
              })
              .catch((err) => {
                reject(err);
              });
          }
        });
        marcStream.on("end", () => {
          console.log("Finished reading stream");
          if (batch.length > 0) {
            _processBatch(batch)
              .then(() => {
                console.log(`Processed batch ${++batchIndex}`);
                resolve();
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            resolve();
          }
        });
        marcStream.on("error", (err) => {
          reject(err);
        });
      });
    });

    await db
      .update(schema.marcFileImports)
      .set({
        status: "COMPLETE",
      })
      .where(
        and(
          eq(schema.marcFileImports.id, importId),
          eq(schema.marcFileImports.libraryId, libraryId)
        )
      );

    for await (const bookIds of addedBookIds) {
      await sqs.sendMessage({
        MessageBody: JSON.stringify({
          bookIds,
        } satisfies BookEmbeddingMessage),
        QueueUrl: Resource.BookEmbeddingQueue.url,
      });
    }
  } catch (err) {
    console.error(err);
    await db
      .update(schema.marcFileImports)
      .set({
        status: "FAILED",
      })
      .where(
        and(
          eq(schema.marcFileImports.id, importId),
          eq(schema.marcFileImports.libraryId, libraryId)
        )
      );
  }
}

async function readStreamFromS3({
  Bucket,
  Key,
}: {
  Bucket: string;
  Key: string;
}) {
  const commandPullObject = new GetObjectCommand({
    Bucket,
    Key,
  });
  const response = await S3.send(commandPullObject);

  return response;
}
