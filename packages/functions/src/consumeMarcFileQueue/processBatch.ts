import * as crypto from "crypto";
import { MarcFileImport } from "@stacks-ils-ion/core/sql/schema";
import { ProcessedData, ProcessedRecord } from "./types";
import { db, schema } from "@stacks-ils-ion/core/sql";

export async function processBatch({
  barcodes,
  batch,
  booksByISBN,
  config,
  importId,
  libraryId,
  tx,
}: {
  barcodes: Set<string>;
  batch: ProcessedData[];
  booksByISBN: Map<
    string,
    {
      bookId: string;
      editionId: string;
    }
  >;
  config: Pick<
    MarcFileImport,
    "duplicateBarcodeBehavior" | "noBarcodeBehavior"
  >;
  importId: string;
  libraryId: string;
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
}): Promise<{ addedBookIds: string[] }> {
  const inserts = mapToInserts({
    barcodes,
    batch,
    booksByISBN,
    config,
    importId,
    libraryId,
  });

  await Promise.all([
    inserts.items.length
      ? tx.insert(schema.catalogItems).values(inserts.items)
      : Promise.resolve(),
    inserts.failedRecords.length
      ? tx
          .insert(schema.marcFileImportFailedRecords)
          .values(inserts.failedRecords)
      : Promise.resolve(),
    inserts.parsedRecords.length
      ? tx
          .insert(schema.marcFileImportParsedRecords)
          .values(inserts.parsedRecords)
      : Promise.resolve(),
  ]);
  await Promise.all([
    inserts.copies.length
      ? tx.insert(schema.catalogItemCopies).values(inserts.copies)
      : Promise.resolve(),
    inserts.books.length
      ? tx.insert(schema.books).values(inserts.books)
      : Promise.resolve(),
  ]);
  await Promise.all([
    inserts.editions.length
      ? tx.insert(schema.bookEditions).values(inserts.editions)
      : Promise.resolve(),
    inserts.bookAuthors.length
      ? tx.insert(schema.bookAuthors).values(inserts.bookAuthors)
      : Promise.resolve(),
    inserts.bookReadingPrograms.length
      ? tx
          .insert(schema.bookReadingPrograms)
          .values(inserts.bookReadingPrograms)
      : Promise.resolve(),
    inserts.bookTopics.length
      ? tx.insert(schema.bookTopics).values(inserts.bookTopics)
      : Promise.resolve(),
  ]);
  if (inserts.editionCopies.length) {
    await tx.insert(schema.bookEditionCopies).values(inserts.editionCopies);
  }

  return { addedBookIds: inserts.books.map((book) => book.itemId) };
}

interface BatchInserts {
  bookAuthors: Array<typeof schema.bookAuthors.$inferInsert>;
  bookReadingPrograms: Array<typeof schema.bookReadingPrograms.$inferInsert>;
  bookTopics: Array<typeof schema.bookTopics.$inferInsert>;
  books: Array<typeof schema.books.$inferInsert>;
  copies: Array<typeof schema.catalogItemCopies.$inferInsert>;
  editionCopies: Array<typeof schema.bookEditionCopies.$inferInsert>;
  editions: Array<typeof schema.bookEditions.$inferInsert>;
  failedRecords: Array<typeof schema.marcFileImportFailedRecords.$inferInsert>;
  items: Array<typeof schema.catalogItems.$inferInsert>;
  parsedRecords: Array<typeof schema.marcFileImportParsedRecords.$inferInsert>;
}

function mapToInserts({
  barcodes,
  batch,
  booksByISBN,
  config,
  importId,
  libraryId,
}: {
  barcodes: Set<string>;
  batch: ProcessedData[];
  booksByISBN: Map<
    string,
    {
      bookId: string;
      editionId: string;
    }
  >;
  config: Pick<
    MarcFileImport,
    "duplicateBarcodeBehavior" | "noBarcodeBehavior"
  >;
  importId: string;
  libraryId: string;
}): BatchInserts {
  return batch.reduce<BatchInserts>(
    (acc, record) => {
      const { parsed, raw } = record;
      if (parsed) {
        const recordId = crypto.randomUUID();
        acc.parsedRecords.push({
          id: recordId,
          importId,
          parsed: parsed.record,
          raw,
        });

        const copiesToAdd = getCopiesToAdd({
          barcodes,
          config,
          copies: parsed.copies,
        });

        if (copiesToAdd.length) {
          let bookEdition = parsed.isbn_10
            ? booksByISBN.get(parsed.isbn_10.toUpperCase())
            : parsed.isbn_13
            ? booksByISBN.get(parsed.isbn_13.toUpperCase())
            : undefined;

          if (!bookEdition) {
            const bookId = crypto.randomUUID();
            const editionId = crypto.randomUUID();
            bookEdition = { bookId, editionId };

            acc.items.push({
              id: bookId,
              libraryId,
            });

            acc.books.push({
              itemId: bookId,
              libraryId,
              readingGrade: parsed.reading_grade,
              seriesEntry: parsed.series_entry,
              seriesName: parsed.series_name,
              summary: parsed.summary,
              targetAgeMax: parsed.target_age_max,
              targetAgeMin: parsed.target_age_min,
              title: parsed.title,
            });

            acc.editions.push({
              bookId,
              id: editionId,
              isbn10: parsed.isbn_10,
              isbn13: parsed.isbn_13,
              libraryId,
              pageCount: parsed.page_count,
              publishedYear: parsed.published_year,
              publisherName: parsed.publisher_name,
            });

            acc.bookAuthors.push(
              ...parsed.authors.map(
                (author): typeof schema.bookAuthors.$inferInsert => ({
                  bookId,
                  index: author.index,
                  libraryId,
                  name: author.name,
                  relation: author.relation,
                })
              )
            );

            acc.bookReadingPrograms.push(
              ...parsed.readingPrograms.map(
                (program): typeof schema.bookReadingPrograms.$inferInsert => ({
                  bookId,
                  libraryId,
                  name: program.name,
                  note: program.note,
                  pointValue: program.point_value,
                  readingLevel: program.reading_level,
                })
              )
            );

            acc.bookTopics.push(
              ...parsed.topics.map(
                (topic): typeof schema.bookTopics.$inferInsert => ({
                  bookId,
                  libraryId,
                  name: topic,
                })
              )
            );

            if (parsed.isbn_10) {
              booksByISBN.set(parsed.isbn_10.toUpperCase(), {
                bookId,
                editionId,
              });
            }
            if (parsed.isbn_13) {
              booksByISBN.set(parsed.isbn_13.toUpperCase(), {
                bookId,
                editionId,
              });
            }
          }

          for (const copy of copiesToAdd) {
            const id = crypto.randomUUID();
            acc.copies.push({
              barcode: copy.barcode,
              id,
              itemId: bookEdition.bookId,
              libraryId,
              location: copy.location,
            });

            acc.editionCopies.push({
              bookId: bookEdition.bookId,
              callNumber: copy.call_number,
              editionId: bookEdition.editionId,
              id,
              importRecordId: recordId,
              libraryId,
            });
          }
        }
      } else {
        acc.failedRecords.push({
          importId,
          raw,
        });
      }

      return acc;
    },
    {
      bookAuthors: [],
      bookReadingPrograms: [],
      bookTopics: [],
      books: [],
      copies: [],
      editionCopies: [],
      editions: [],
      failedRecords: [],
      items: [],
      parsedRecords: [],
    }
  );
}

function getCopiesToAdd({
  barcodes,
  config,
  copies,
}: {
  barcodes: Set<string>;
  config: Pick<
    MarcFileImport,
    "duplicateBarcodeBehavior" | "noBarcodeBehavior"
  >;
  copies: ProcessedRecord["copies"];
}) {
  if (!copies.length) {
    if (config.noBarcodeBehavior === "SKIP") {
      return [];
    }
    const barcode = getNextAvailableBarcode(barcodes);
    barcodes.add(barcode);
    return [{ barcode, call_number: undefined, location: undefined }];
  }

  return copies.reduce<
    Array<
      ProcessedRecord["copies"][number] & {
        barcode: string;
      }
    >
  >((acc, copy) => {
    if (copy.barcode) {
      if (barcodes.has(copy.barcode)) {
        const barcode = getNextAvailableBarcode(barcodes);
        acc.push({ ...copy, barcode });
        barcodes.add(barcode);
        return acc;
      } else {
        acc.push({ ...copy, barcode: copy.barcode });
        return acc;
      }
    } else {
      if (config.noBarcodeBehavior === "SKIP") {
        return acc;
      }

      const barcode = getNextAvailableBarcode(barcodes);
      acc.push({ ...copy, barcode });
      barcodes.add(barcode);
      return acc;
    }
  }, []);
}

function getNextAvailableBarcode(barcodes: Set<string>) {
  let i = 0;
  while (barcodes.has(i.toString().padStart(6, "0"))) {
    i++;
  }
  return i.toString().padStart(6, "0");
}
