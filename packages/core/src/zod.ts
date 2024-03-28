import { z } from "zod";

export const nonEmptyString = z
  .string()
  .refine((val) => Boolean(val.trim().length), {
    message: "Value cannot be empty.",
  });

export const isoDateOnly = z.string().refine((val) => {
  try {
    const date = new Date(val);
    return val === date.toISOString().split("T")[0];
  } catch {
    return false;
  }
});

export const catalogItemQuerySchema = z
  .object({
    authors: z.array(z.string()).optional(),
    collections: z.array(z.string()).optional(),
    createdOnOrAfter: isoDateOnly.optional(),
    createdOnOrBefore: isoDateOnly.optional(),
    hasCopiesAvailable: z.boolean().optional(),
    sortBy: z
      .enum(["createdAtDesc", "createdAtAsc", "titleAsc"])
      .default("createdAtDesc"),
    targetAgeMax: z.number().int().nonnegative().optional(),
    targetAgeMin: z.number().int().nonnegative().optional(),
    titleOrISBN: z.string().optional(),
    topics: z.array(z.string().min(1)).optional(),
  })
  .superRefine((val, ctx) => {
    if (
      val.createdOnOrAfter &&
      val.createdOnOrBefore &&
      new Date(val.createdOnOrAfter).getTime() >
        new Date(val.createdOnOrBefore).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date range.",
        path: ["createdOnOrAfter"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date range.",
        path: ["createdOnOrBefore"],
      });
    }
    if (
      typeof val.targetAgeMax === "number" &&
      typeof val.targetAgeMin === "number" &&
      val.targetAgeMax < val.targetAgeMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid target age range.",
        path: ["targetAgeMax"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid target age range.",
        path: ["targetAgeMin"],
      });
    }
  });
export type CatalogItemQueryJson = z.infer<typeof catalogItemQuerySchema>;

export const addTitleCopiesSchema = (
  barcodeTaken: (props: {
    barcode: string;
    libraryId: string;
  }) => Promise<unknown>
) =>
  z
    .object({
      authors: z.array(
        z.object({
          name: z
            .object({
              label: z.string(),
              value: z.string(),
            })
            .nullable(),
          relation: z.string(),
        })
      ),
      copies: z
        .array(
          z.object({
            acquisition_date: isoDateOnly.nullable(),
            barcode: nonEmptyString,
            call_number: z.string(),
            location: z.string(),
            purchase_price_amount: z.number().nullable(),
          })
        )
        .min(1),
      existingEditionId: z.string(),
      isbn_10: z.string().optional(),
      isbn_13: z.string().optional(),
      libraryId: z.string(),
      page_count: z.number().int().positive().nullable(),
      published_year: z.number().int().positive().nullable(),
      publisher_name: z.string(),
      readingPrograms: z.array(
        z.object({
          name: z
            .object({ label: nonEmptyString, value: z.string() })
            .nullable(),
          note: z.string(),
          point_value: z.number().nonnegative().nullable(),
          reading_level: z.number().nonnegative().nullable(),
        })
      ),
      reading_grade: z.number().nonnegative().nullable(),
      series_entry: z.string().optional(),
      series_name: z
        .object({ label: z.string(), value: z.string() })
        .nullable(),
      summary: z.string(),
      target_age_max: z.number().int().positive().nullable(),
      target_age_min: z.number().int().nonnegative().nullable(),
      title: z.object({ label: nonEmptyString, value: z.string() }),
      topics: z.array(z.object({ label: nonEmptyString, value: z.string() })),
    })
    .superRefine(async (val, ctx) => {
      if (!val.title.value) {
        val.authors.forEach((author, i) => {
          if (!author.name) {
            ctx.addIssue({
              code: "custom",
              message: "Author name is required.",
              path: ["authors", i, "name"],
            });
          }
        });

        val.readingPrograms.forEach((program, i) => {
          if (!program.name) {
            ctx.addIssue({
              code: "custom",
              message: "Program name is required.",
              path: ["readingPrograms", i, "name"],
            });
          }
        });
      }

      if (!val.existingEditionId || !val.title.value) {
        if (val.isbn_10 && !/^(\d{10}|\d{9}x)$/i.test(val.isbn_10)) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid 10-digit ISBN",
            path: ["isbn_10"],
          });
        }
        if (val.isbn_13 && !/^\d{13}$/.test(val.isbn_13)) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid 13-digit ISBN",
            path: ["isbn_13"],
          });
        }
      }

      const barcodes: string[] = [];
      for await (const [i, copy] of val.copies.entries()) {
        if (barcodes.includes(copy.barcode)) {
          ctx.addIssue({
            code: "custom",
            message: "Duplicate barcode.",
            path: ["copies", i, "barcode"],
          });
        }
        barcodes.push(copy.barcode);
        if (
          await barcodeTaken({
            barcode: copy.barcode,
            libraryId: val.libraryId,
          })
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Barcode taken.",
            path: ["copies", i, "barcode"],
          });
        }
      }
    });

export const patronQuerySchema = z
  .object({
    // birthMonthOnOrAfter: z.number().int().min(1).max(12).optional(),
    // birthMonthOnOrBefore: z.number().int().min(1).max(12).optional(),
    bornOnOrAfter: isoDateOnly.optional(),
    bornOnOrBefore: isoDateOnly.optional(),
    createdOnOrAfter: isoDateOnly.optional(),
    createdOnOrBefore: isoDateOnly.optional(),
    groups: z.array(z.string()).min(1).optional(),
    hasCheckedOutItems: z.enum(["true", "false", "overdue"]).optional(),
    hasHolds: z.boolean().optional(),
    includeDeleted: z.boolean().optional(),
    nameOrBarcode: z.string().optional(),
    noGroup: z.boolean().optional(),
    sortBy: z.enum(["lastNameAsc", "lastNameDesc"]).default("lastNameAsc"),
  })
  .superRefine((val, ctx) => {
    if (
      val.bornOnOrAfter &&
      val.bornOnOrBefore &&
      new Date(val.bornOnOrAfter).getTime() >
        new Date(val.bornOnOrBefore).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date range.",
        path: ["bornOnOrAfter"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date range.",
        path: ["bornOnOrBefore"],
      });
    }
    if (
      val.createdOnOrAfter &&
      val.createdOnOrBefore &&
      new Date(val.createdOnOrAfter).getTime() >
        new Date(val.createdOnOrBefore).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date range.",
        path: ["createdOnOrAfter"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date range.",
        path: ["createdOnOrBefore"],
      });
    }
    // if (
    //   typeof val.birthMonthOnOrAfter === "number" &&
    //   typeof val.birthMonthOnOrBefore === "number" &&
    //   val.birthMonthOnOrBefore < val.birthMonthOnOrAfter
    // ) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: "Invalid date range.",
    //     path: ["birthMonthOnOrAfter"],
    //   });
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: "Invalid date range.",
    //     path: ["birthMonthOnOrBefore"],
    //   });
    // }
  });
export type PatronQueryJson = z.infer<typeof patronQuerySchema>;
