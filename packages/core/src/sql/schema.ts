import { CatalogItemQueryJson, PatronQueryJson } from "../zod";
import { InferSelectModel, relations, sql } from "drizzle-orm";
import { MarcRecord } from "../models";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { customVector } from "@useverk/drizzle-pgvector";
import type { AdapterAccount } from "@auth/core/adapters";

//#region next-auth
export const users = pgTable("user", {
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  id: text("id").notNull().primaryKey(),
  image: text("image"),
  name: text("name"),
});

export type User = InferSelectModel<typeof users>;

export const accounts = pgTable(
  "account",
  {
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    id_token: text("id_token"),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    scope: text("scope"),
    session_state: text("session_state"),
    token_type: text("token_type"),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  expires: timestamp("expires", { mode: "date" }).notNull(),
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    expires: timestamp("expires", { mode: "date" }).notNull(),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
//#endregion next-auth

const defaultUUID = sql`gen_random_uuid()`;

export const books = pgTable(
  "book",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    embeddingId: text("embedding_id").references(() => embeddings.id, {
      onDelete: "set null",
    }),
    itemId: text("item_id").primaryKey(),
    libraryId: text("library_id").notNull(),
    readingGrade: real("reading_grade"),
    seriesEntry: text("series_entry"),
    seriesName: text("series_name"),
    summary: text("summary"),
    targetAgeMax: integer("target_age_max"),
    targetAgeMin: integer("target_age_min"),
    title: text("title").notNull(),
  },
  (t) => ({
    id_by_library: uniqueIndex().on(t.itemId, t.libraryId),
    library_item: foreignKey({
      columns: [t.itemId, t.libraryId],
      foreignColumns: [catalogItems.id, catalogItems.libraryId],
    }),
  })
);

export type Book = InferSelectModel<typeof books>;

export const bookRelations = relations(books, ({ many, one }) => ({
  authors: many(bookAuthors),
  editions: many(bookEditions),
  item: one(catalogItems, {
    fields: [books.itemId],
    references: [catalogItems.id],
  }),
  readingPrograms: many(bookReadingPrograms),
  topics: many(bookTopics),
}));

export const bookAuthors = pgTable(
  "book_author",
  {
    bookId: text("book_id")
      .notNull()
      .references(() => books.itemId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    index: integer("index").notNull(),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    relation: text("relation"),
  },
  (t) => ({
    item_library: foreignKey({
      columns: [t.bookId, t.libraryId],
      foreignColumns: [catalogItems.id, catalogItems.libraryId],
    }),
    name_by_library: index().on(t.name, t.libraryId),
  })
);

export type BookAuthor = InferSelectModel<typeof bookAuthors>;

export const bookAuthorRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.itemId],
  }),
  item: one(catalogItems, {
    fields: [bookAuthors.bookId],
    references: [catalogItems.id],
  }),
  library: one(libraries, {
    fields: [bookAuthors.libraryId],
    references: [libraries.id],
  }),
}));

export const bookEditions = pgTable(
  "book_edition",
  {
    bookId: text("book_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    isbn10: text("isbn_10"),
    isbn13: text("isbn_13"),
    libraryId: text("library_id").notNull(),
    pageCount: integer("page_count"),
    publishedYear: integer("published_year"),
    publisherName: text("publisher_name"),
  },
  (t) => ({
    book_library: foreignKey({
      columns: [t.bookId, t.libraryId],
      foreignColumns: [books.itemId, books.libraryId],
    }),
    id_by_book_by_library: uniqueIndex().on(t.id, t.bookId, t.libraryId),
  })
);

export type BookEdition = InferSelectModel<typeof bookEditions>;

export const bookEditionRelations = relations(
  bookEditions,
  ({ many, one }) => ({
    book: one(books, {
      fields: [bookEditions.bookId],
      references: [books.itemId],
    }),
    copies: many(bookEditionCopies),
    item: one(catalogItems, {
      fields: [bookEditions.bookId],
      references: [catalogItems.id],
    }),
  })
);

export const bookEditionCopies = pgTable(
  "book_edition_copy",
  {
    bookId: text("book_id")
      .notNull()
      .references(() => books.itemId, {
        onDelete: "cascade",
      }),
    callNumber: text("call_number"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    editionId: text("edition_id").notNull(),
    id: text("id").primaryKey(),
    importRecordId: text("import_record_id").references(
      () => marcFileImportParsedRecords.id,
      { onDelete: "set null" }
    ),
    libraryId: text("library_id").notNull(),
  },
  (t) => ({
    copy_reference: foreignKey({
      columns: [t.bookId, t.id, t.libraryId],
      foreignColumns: [
        catalogItemCopies.itemId,
        catalogItemCopies.id,
        catalogItemCopies.libraryId,
      ],
    }),
    edition_reference: foreignKey({
      columns: [t.bookId, t.editionId, t.libraryId],
      foreignColumns: [
        bookEditions.bookId,
        bookEditions.id,
        bookEditions.libraryId,
      ],
    }),
  })
);

export type BookEditionCopy = InferSelectModel<typeof bookEditionCopies>;

export const bookEditionCopyRelations = relations(
  bookEditionCopies,
  ({ one }) => ({
    book: one(books, {
      fields: [bookEditionCopies.bookId],
      references: [books.itemId],
    }),
    copy: one(catalogItemCopies, {
      fields: [
        bookEditionCopies.bookId,
        bookEditionCopies.id,
        bookEditionCopies.libraryId,
      ],
      references: [
        catalogItemCopies.itemId,
        catalogItemCopies.id,
        catalogItemCopies.libraryId,
      ],
    }),
    edition: one(bookEditions, {
      fields: [bookEditionCopies.editionId],
      references: [bookEditions.id],
    }),
    importRecord: one(marcFileImportParsedRecords, {
      fields: [bookEditionCopies.importRecordId],
      references: [marcFileImportParsedRecords.id],
    }),
    item: one(catalogItems, {
      fields: [bookEditionCopies.bookId],
      references: [catalogItems.id],
    }),
  })
);

export const bookReadingPrograms = pgTable(
  "book_reading_program",
  {
    bookId: text("book_id")
      .notNull()
      .references(() => books.itemId, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    note: text("note"),
    pointValue: real("point_value"),
    readingLevel: real("reading_level"),
  },
  (t) => ({
    item_library: foreignKey({
      columns: [t.bookId, t.libraryId],
      foreignColumns: [catalogItems.id, catalogItems.libraryId],
    }),
    name_by_library: index().on(t.name, t.libraryId),
  })
);

export type BookReadingProgram = InferSelectModel<typeof bookReadingPrograms>;

export const bookReadingProgramRelations = relations(
  bookReadingPrograms,
  ({ one }) => ({
    book: one(books, {
      fields: [bookReadingPrograms.bookId],
      references: [books.itemId],
    }),
    item: one(catalogItems, {
      fields: [bookReadingPrograms.bookId],
      references: [catalogItems.id],
    }),
    library: one(libraries, {
      fields: [bookReadingPrograms.libraryId],
      references: [libraries.id],
    }),
  })
);

export const bookTopics = pgTable(
  "book_topic",
  {
    bookId: text("book_id")
      .notNull()
      .references(() => books.itemId, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
  },
  (t) => ({
    item_library: foreignKey({
      columns: [t.bookId, t.libraryId],
      foreignColumns: [catalogItems.id, catalogItems.libraryId],
    }),
    name_by_library: index().on(t.name, t.libraryId),
  })
);

export type BookTopic = InferSelectModel<typeof bookTopics>;

export const bookTopicRelations = relations(bookTopics, ({ one }) => ({
  book: one(books, {
    fields: [bookTopics.bookId],
    references: [books.itemId],
  }),
  item: one(catalogItems, {
    fields: [bookTopics.bookId],
    references: [catalogItems.id],
  }),
  library: one(libraries, {
    fields: [bookTopics.libraryId],
    references: [libraries.id],
  }),
}));

export const catalogItems = pgTable(
  "catalog_item",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, {
        onDelete: "cascade",
      }),
  },
  (t) => ({
    id_by_library: uniqueIndex().on(t.id, t.libraryId),
  })
);

export type CatalogItem = InferSelectModel<typeof catalogItems>;

export const catalogItemRelations = relations(
  catalogItems,
  ({ many, one }) => ({
    book: one(books),
    collections: many(catalogItemCollectionAssignments),
    copies: many(catalogItemCopies),
    holds: many(holds),
    library: one(libraries, {
      fields: [catalogItems.libraryId],
      references: [libraries.id],
    }),
  })
);

export const catalogItemCollections = pgTable(
  "catalog_item_collection",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    policyId: text("policy_id").references(() => catalogItemPolicies.id, {
      onDelete: "set null",
    }),
  },
  (t) => ({
    name_by_library: uniqueIndex().on(t.name, t.libraryId),
  })
);

export type CatalogItemCollection = InferSelectModel<
  typeof catalogItemCollections
>;

export const catalogItemCollectionRelations = relations(
  catalogItemCollections,
  ({ many, one }) => ({
    items: many(catalogItemCollectionAssignments),
    library: one(libraries, {
      fields: [catalogItemCollections.libraryId],
      references: [libraries.id],
    }),
    policy: one(catalogItemPolicies, {
      fields: [catalogItemCollections.policyId],
      references: [catalogItemPolicies.id],
    }),
  })
);

export const catalogItemCollectionAssignments = pgTable(
  "catalog_item_collection_assignment",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => catalogItemCollections.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    itemId: text("item_id")
      .notNull()
      .references(() => catalogItems.id, { onDelete: "cascade" }),
  },
  (t) => ({
    primary_key: primaryKey({ columns: [t.collectionId, t.itemId] }),
  })
);

export type CatalogItemCollectionAssignment = InferSelectModel<
  typeof catalogItemCollectionAssignments
>;

export const catalogItemCollectionAssignmentRelations = relations(
  catalogItemCollectionAssignments,
  ({ one }) => ({
    collection: one(catalogItemCollections, {
      fields: [catalogItemCollectionAssignments.collectionId],
      references: [catalogItemCollections.id],
    }),
    item: one(catalogItems, {
      fields: [catalogItemCollectionAssignments.itemId],
      references: [catalogItems.id],
    }),
  })
);

export const catalogItemCopies = pgTable(
  "catalog_item_copy",
  {
    acquisitionDate: date("acquisition_date", { mode: "string" }),
    availability: text("availability", {
      enum: ["AVAILABLE", "DELETED", "UNAVAILABLE"],
    })
      .notNull()
      .default("AVAILABLE"),
    barcode: text("barcode").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    itemId: text("item_id").notNull(),
    libraryId: text("library_id").notNull(),
    location: text("location"),
    purchasePriceAmount: real("purchase_price_amount"),
    purchasePriceCurrency: text("currency", { enum: ["USD"] })
      .notNull()
      .default("USD"),
  },
  (t) => ({
    barcode_by_library: uniqueIndex().on(t.barcode, t.libraryId),
    id_by_item_by_library: uniqueIndex().on(t.id, t.itemId, t.libraryId),
    id_by_library: uniqueIndex().on(t.id, t.libraryId),
    item_library: foreignKey({
      columns: [t.itemId, t.libraryId],
      foreignColumns: [catalogItems.id, catalogItems.libraryId],
    }),
  })
);

export type CatalogItemCopy = InferSelectModel<typeof catalogItemCopies>;

export const catalogItemCopyRelations = relations(
  catalogItemCopies,
  ({ many, one }) => ({
    bookCopy: one(bookEditionCopies),
    checkouts: many(checkouts),
    item: one(catalogItems, {
      fields: [catalogItemCopies.itemId],
      references: [catalogItems.id],
    }),
    library: one(libraries, {
      fields: [catalogItemCopies.libraryId],
      references: [libraries.id],
    }),
  })
);

export const catalogItemPolicies = pgTable(
  "catalog_item_policy",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    extensionLimit: integer("extension_limit"),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, {
        onDelete: "cascade",
      }),
    loanPeriodDays: integer("loan_period_days"),
    name: text("name").notNull(),
  },
  (t) => ({
    id_by_library: uniqueIndex().on(t.id, t.libraryId),
    name_by_library: uniqueIndex().on(t.name, t.libraryId),
  })
);

export type CatalogItemPolicy = InferSelectModel<typeof catalogItemPolicies>;

export const catalogItemPolicyRelations = relations(
  catalogItemPolicies,
  ({ many, one }) => ({
    collections: many(catalogItemCollections),
    library: one(libraries, {
      fields: [catalogItemPolicies.libraryId],
      references: [libraries.id],
    }),
    restrictions: many(checkoutRestrictions),
  })
);

export const catalogItemQueries = pgTable(
  "catalog_item_query",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id").notNull(),
    name: text("name").notNull(),
    organizationId: text("organization_id").notNull(),
    ownerId: text("owner_id").notNull(),
    query: json("query").$type<CatalogItemQueryJson>().notNull(),
    type: text("catalog_item_query_type", {
      enum: ["PRIVATE", "PUBLIC", "SHARED"],
    })
      .notNull()
      .default("PRIVATE"),
  },
  (t) => ({
    library_org: foreignKey({
      columns: [t.libraryId, t.organizationId],
      foreignColumns: [libraries.id, libraries.organizationId],
    }),
    name_by_library_by_owner: uniqueIndex().on(t.name, t.libraryId, t.ownerId),
    org_user: foreignKey({
      columns: [t.organizationId, t.ownerId],
      foreignColumns: [
        organizationUsers.organizationId,
        organizationUsers.userId,
      ],
    }),
  })
);

export type CatalogItemQuery = InferSelectModel<typeof catalogItemQueries>;

export const catalogItemQueryRelations = relations(
  catalogItemQueries,
  ({ one }) => ({
    library: one(libraries, {
      fields: [catalogItemQueries.libraryId],
      references: [libraries.id],
    }),
    organization: one(organizations, {
      fields: [catalogItemQueries.organizationId],
      references: [organizations.id],
    }),
    owner: one(organizationUsers, {
      fields: [catalogItemQueries.organizationId, catalogItemQueries.ownerId],
      references: [organizationUsers.organizationId, organizationUsers.userId],
    }),
  })
);

export const checkouts = pgTable(
  "checkout",
  {
    copyId: text("copy_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    createdById: text("created_by").notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    extensionCount: integer("extension_count").notNull().default(0),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id").notNull(),
    organizationId: text("organization_id").notNull(),
    patronId: text("patron_id").notNull(),
    returnedDatetime: timestamp("returned_datetime", { mode: "date" }),
  },
  (t) => ({
    copy_library: foreignKey({
      columns: [t.copyId, t.libraryId],
      foreignColumns: [catalogItemCopies.id, catalogItemCopies.libraryId],
    }),
    library_org: foreignKey({
      columns: [t.libraryId, t.organizationId],
      foreignColumns: [libraries.id, libraries.organizationId],
    }),
    org_user: foreignKey({
      columns: [t.organizationId, t.createdById],
      foreignColumns: [
        organizationUsers.organizationId,
        organizationUsers.userId,
      ],
    }),
    patron_org: foreignKey({
      columns: [t.patronId, t.organizationId],
      foreignColumns: [patrons.id, patrons.organizationId],
    }),
  })
);

export type Checkout = InferSelectModel<typeof checkouts>;

export const checkoutRelations = relations(checkouts, ({ one }) => ({
  copy: one(catalogItemCopies, {
    fields: [checkouts.copyId, checkouts.libraryId],
    references: [catalogItemCopies.id, catalogItemCopies.libraryId],
  }),
  createdBy: one(organizationUsers, {
    fields: [checkouts.organizationId, checkouts.createdById],
    references: [organizationUsers.organizationId, organizationUsers.userId],
  }),
  library: one(libraries, {
    fields: [checkouts.libraryId, checkouts.organizationId],
    references: [libraries.id, libraries.organizationId],
  }),
  organization: one(organizations, {
    fields: [checkouts.organizationId],
    references: [organizations.id],
  }),
  patron: one(patrons, {
    fields: [checkouts.patronId, checkouts.organizationId],
    references: [patrons.id, patrons.organizationId],
  }),
}));

export const checkoutRestrictions = pgTable(
  "checkout_restriction",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    itemPolicyId: text("item_policy_id").notNull(),
    libraryId: text("library_id").notNull(),
    patronPolicyId: text("patron_policy_id").notNull(),
  },
  (t) => ({
    item_policy_by_patron_policy: uniqueIndex().on(
      t.itemPolicyId,
      t.patronPolicyId
    ),
    item_policy_library: foreignKey({
      columns: [t.itemPolicyId, t.libraryId],
      foreignColumns: [catalogItemPolicies.id, catalogItemPolicies.libraryId],
    }),
    patron_policy_library: foreignKey({
      columns: [t.patronPolicyId, t.libraryId],
      foreignColumns: [
        libraryPatronPolicies.id,
        libraryPatronPolicies.libraryId,
      ],
    }),
  })
);

export type CheckoutRestriction = InferSelectModel<typeof checkoutRestrictions>;

export const checkoutRestrictionRelations = relations(
  checkoutRestrictions,
  ({ one }) => ({
    itemPolicy: one(catalogItemPolicies, {
      fields: [
        checkoutRestrictions.itemPolicyId,
        checkoutRestrictions.libraryId,
      ],
      references: [catalogItemPolicies.id, catalogItemPolicies.libraryId],
    }),
    library: one(libraries, {
      fields: [checkoutRestrictions.libraryId],
      references: [libraries.id],
    }),
    patronPolicy: one(libraryPatronPolicies, {
      fields: [
        checkoutRestrictions.patronPolicyId,
        checkoutRestrictions.libraryId,
      ],
      references: [libraryPatronPolicies.id, libraryPatronPolicies.libraryId],
    }),
  })
);

export const embeddings = pgTable(
  "embedding",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    input: text("input").notNull(),
    model: text("model", { enum: ["text-embedding-3-small"] }).notNull(),
    value: customVector("value", { dimensions: 1536 }).notNull(),
  },
  (t) => ({
    input: index().on(t.input),
  })
);

export const holds = pgTable(
  "hold",
  {
    copyId: text("copy_id").unique(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    itemId: text("item_id").notNull(),
    libraryId: text("library_id").notNull(),
    organizationId: text("organization_id").notNull(),
    patronId: text("patron_id").notNull(),
    status: text("hold_status", { enum: ["ACTIVE", "CANCELLED"] })
      .notNull()
      .default("ACTIVE"),
  },
  (t) => ({
    copy_item: foreignKey({
      columns: [t.copyId, t.itemId, t.libraryId],
      foreignColumns: [
        catalogItemCopies.id,
        catalogItemCopies.itemId,
        catalogItemCopies.libraryId,
      ],
    }),
    item_by_patron: uniqueIndex().on(t.itemId, t.patronId),
    item_library: foreignKey({
      columns: [t.itemId, t.libraryId],
      foreignColumns: [catalogItems.id, catalogItems.libraryId],
    }),
    library_org: foreignKey({
      columns: [t.libraryId, t.organizationId],
      foreignColumns: [libraries.id, libraries.organizationId],
    }),
    patron_org: foreignKey({
      columns: [t.patronId, t.organizationId],
      foreignColumns: [patrons.id, patrons.organizationId],
    }),
  })
);

export type Hold = InferSelectModel<typeof holds>;

export const holdRelations = relations(holds, ({ one }) => ({
  copy: one(catalogItemCopies, {
    fields: [holds.copyId, holds.itemId, holds.libraryId],
    references: [
      catalogItemCopies.id,
      catalogItemCopies.itemId,
      catalogItemCopies.libraryId,
    ],
  }),
  item: one(catalogItems, {
    fields: [holds.itemId, holds.libraryId],
    references: [catalogItems.id, catalogItems.libraryId],
  }),
  library: one(libraries, {
    fields: [holds.libraryId, holds.organizationId],
    references: [libraries.id, libraries.organizationId],
  }),
  organization: one(organizations, {
    fields: [holds.organizationId],
    references: [organizations.id],
  }),
  patron: one(patrons, {
    fields: [holds.patronId, holds.organizationId],
    references: [patrons.id, patrons.organizationId],
  }),
}));

export const holidays = pgTable("holiday", {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  date: date("date", { mode: "string" }).notNull(),
  id: text("id").primaryKey().default(defaultUUID),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  toDate: date("date", { mode: "string" }),
});

export type Holiday = InferSelectModel<typeof holidays>;

export const holidayRelations = relations(holidays, ({ one }) => ({
  organization: one(organizations, {
    fields: [holidays.organizationId],
    references: [organizations.id],
  }),
}));

export const libraries = pgTable(
  "library",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    defaultConcurrentLoanLimit: integer("default_concurrent_loan_limit")
      .notNull()
      .default(10),
    defaultExtensionLimit: integer("default_extension_limit")
      .notNull()
      .default(1),
    defaultLoanPeriodDays: integer("default_loan_period_days")
      .notNull()
      .default(10),
    excludeHolidaysWeekends: boolean("exclude_holidays_weekends")
      .notNull()
      .default(true),
    id: text("id").primaryKey().default(defaultUUID),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
  },
  (t) => ({
    id_by_organization: uniqueIndex().on(t.id, t.organizationId),
    name_by_organization: uniqueIndex().on(t.name, t.organizationId),
  })
);

export type Library = InferSelectModel<typeof libraries>;

export const libraryRelations = relations(libraries, ({ many, one }) => ({
  bookAuthors: many(bookAuthors),
  bookReadingPrograms: many(bookReadingPrograms),
  bookTopics: many(bookTopics),
  catalogItemCollections: many(catalogItemCollections),
  catalogItemCopies: many(catalogItemCopies),
  catalogItemPolicies: many(catalogItemPolicies),
  catalogItemQueries: many(catalogItemQueries),
  catalogItems: many(catalogItems),
  checkoutCeiling: one(libraryCheckoutCeilings),
  checkoutRestrictions: many(checkoutRestrictions),
  checkouts: many(checkouts),
  holds: many(holds),
  libraryPatronPolicies: many(libraryPatronPolicies),
  marcFileImports: many(marcFileImports),
  organization: one(organizations, {
    fields: [libraries.organizationId],
    references: [organizations.id],
  }),
}));

export const libraryCheckoutCeilings = pgTable("library_checkout_ceiling", {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  libraryId: text("library_id")
    .primaryKey()
    .references(() => libraries.id, { onDelete: "cascade" }),
  toDate: date("to_date", { mode: "string" }).notNull(),
});

export type LibraryCheckoutCeiling = InferSelectModel<
  typeof libraryCheckoutCeilings
>;

export const libraryCheckoutCeilingRelations = relations(
  libraryCheckoutCeilings,
  ({ one }) => ({
    library: one(libraries, {
      fields: [libraryCheckoutCeilings.libraryId],
      references: [libraries.id],
    }),
  })
);

export const libraryPatronPolicies = pgTable(
  "library_patron_policy",
  {
    concurrentLoanLimit: integer("concurrent_loan_limit"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    extensionLimit: integer("extension_limit"),
    id: text("id").primaryKey().default(defaultUUID),
    libraryId: text("library_id").notNull(),
    loanPeriodDays: integer("loan_period_days"),
    name: text("name").notNull(),
    organizationId: text("organization_id").notNull(),
  },
  (t) => ({
    id_by_library: uniqueIndex().on(t.id, t.libraryId),
    library_org: foreignKey({
      columns: [t.libraryId, t.organizationId],
      foreignColumns: [libraries.id, libraries.organizationId],
    }),
    name_by_library: uniqueIndex().on(t.name, t.libraryId),
  })
);

export type LibraryPatronPolicy = InferSelectModel<
  typeof libraryPatronPolicies
>;

export const libraryPatronPolicyRelations = relations(
  libraryPatronPolicies,
  ({ many, one }) => ({
    groups: many(patronGroupLibraryPolicyAssignments),
    library: one(libraries, {
      fields: [
        libraryPatronPolicies.libraryId,
        libraryPatronPolicies.organizationId,
      ],
      references: [libraries.id, libraries.organizationId],
    }),
    organization: one(organizations, {
      fields: [libraryPatronPolicies.organizationId],
      references: [organizations.id],
    }),
    restrictions: many(checkoutRestrictions),
  })
);

export const marcFileImports = pgTable("marc_file_import", {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  duplicateBarcodeBehavior: text("duplicate_barcode_behavior", {
    enum: ["CREATE_NEW", "SKIP"],
  }).notNull(),
  fileKey: text("file_key").notNull(),
  id: text("id").primaryKey().default(defaultUUID),
  libraryId: text("library_id")
    .notNull()
    .references(() => libraries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  noBarcodeBehavior: text("no_barcode_behavior", {
    enum: ["CREATE_NEW", "SKIP"],
  }).notNull(),
  status: text("status", {
    enum: ["PENDING", "PARSING", "COMPLETE", "FAILED"],
  })
    .notNull()
    .default("PENDING"),
});

export type MarcFileImport = InferSelectModel<typeof marcFileImports>;

export const marcFileImportRelations = relations(
  marcFileImports,
  ({ many, one }) => ({
    library: one(libraries, {
      fields: [marcFileImports.libraryId],
      references: [libraries.id],
    }),
    records: many(marcFileImportParsedRecords),
  })
);

export const marcFileImportFailedRecords = pgTable(
  "marc_file_import_failed_record",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    importId: text("import_id")
      .notNull()
      .references(() => marcFileImports.id, { onDelete: "cascade" }),
    raw: text("raw").notNull(),
  }
);

export type MarcFileImportFailedRecord = InferSelectModel<
  typeof marcFileImportFailedRecords
>;

export const marcFileImportFailedRecordRelations = relations(
  marcFileImportFailedRecords,
  ({ one }) => ({
    import: one(marcFileImports, {
      fields: [marcFileImportFailedRecords.importId],
      references: [marcFileImports.id],
    }),
  })
);

export const marcFileImportParsedRecords = pgTable(
  "marc_file_import_parsed_record",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    importId: text("import_id")
      .notNull()
      .references(() => marcFileImports.id, { onDelete: "cascade" }),
    parsed: json("parsed").notNull().$type<MarcRecord>(),
    raw: text("raw").notNull(),
  }
);

export type MarcFileImportParsedRecord = InferSelectModel<
  typeof marcFileImportParsedRecords
>;

export const marcFileImportParsedRecordRelations = relations(
  marcFileImportParsedRecords,
  ({ one }) => ({
    import: one(marcFileImports, {
      fields: [marcFileImportParsedRecords.importId],
      references: [marcFileImports.id],
    }),
  })
);

export const oneRosterIntegrationConfigs = pgTable(
  "one_roster_integration_config",
  {
    baseUrl: text("base_url").notNull(),
    clientId: text("client_id").notNull(),
    clientSecret: text("client_secret").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tokenUrl: text("token_url").notNull(),
  }
);

export type OneRosterIntegrationConfig = InferSelectModel<
  typeof oneRosterIntegrationConfigs
>;

export const oneRosterIntegrationConfigRelations = relations(
  oneRosterIntegrationConfigs,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [oneRosterIntegrationConfigs.organizationId],
      references: [organizations.id],
    }),
  })
);

export const organizations = pgTable("organization", {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  howHeard: text("how_heard"),
  id: text("id").primaryKey().default(defaultUUID),
  name: text("name").notNull(),
});

export type Organization = InferSelectModel<typeof organizations>;

export const organizationRelations = relations(organizations, ({ many }) => ({
  catalogItemQueries: many(catalogItemQueries),
  checkouts: many(checkouts),
  holds: many(holds),
  holidays: many(holidays),
  libraries: many(libraries),
  libraryPatronPolicies: many(libraryPatronPolicies),
  patronGroupLibraryPolicyAssignments: many(
    patronGroupLibraryPolicyAssignments
  ),
  patronGroups: many(patronGroups),
  patronImports: many(patronImports),
  patrons: many(patrons),
  users: many(organizationUsers),
}));

const roles = ["ADMIN", "STAFF", "CLERK"] as const;
export type OrgRole = (typeof roles)[number];

export const organizationInvites = pgTable(
  "organization_invite",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    email: text("email").notNull(),
    id: text("id").primaryKey().default(defaultUUID),
    normalizedEmail: text("normalized_email").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role", { enum: roles }).notNull(),
  },
  (t) => ({
    email_by_organization: uniqueIndex().on(
      t.normalizedEmail,
      t.organizationId
    ),
  })
);

export type OrganizationInvite = InferSelectModel<typeof organizationInvites>;

export const organizationInviteRelations = relations(
  organizationInvites,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationInvites.organizationId],
      references: [organizations.id],
    }),
  })
);

export const organizationUsers = pgTable(
  "organization_user",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role", { enum: roles }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    primary_key: primaryKey({ columns: [t.organizationId, t.userId] }),
  })
);

export type OrganizationUser = InferSelectModel<typeof organizationUsers>;

export const organizationUserRelations = relations(
  organizationUsers,
  ({ many, one }) => ({
    catalogItemQueries: many(catalogItemQueries),
    checkouts: many(checkouts),
    organization: one(organizations, {
      fields: [organizationUsers.organizationId],
      references: [organizations.id],
    }),
    patronQueries: many(patronQueries),
    user: one(users, {
      fields: [organizationUsers.userId],
      references: [users.id],
    }),
  })
);

export const patrons = pgTable(
  "patron",
  {
    barcode: text("barcode").notNull(),
    birthDate: date("birth_date", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    deleted: boolean("deleted").notNull().default(false),
    email: text("email"),
    firstName: text("first_name").notNull(),
    gender: text("gender", { enum: ["FEMALE", "MALE"] }),
    id: text("id").primaryKey().default(defaultUUID),
    lastName: text("last_name").notNull(),
    oneRosterSourcedId: text("one_roster_sourced_id"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    preferredName: text("preferred_name"),
  },
  (t) => ({
    barcode_by_org: uniqueIndex().on(t.barcode, t.organizationId),
    id_by_organization: uniqueIndex().on(t.id, t.organizationId),
    one_roster_id_by_org: uniqueIndex().on(
      t.oneRosterSourcedId,
      t.organizationId
    ),
  })
);

export type Patron = InferSelectModel<typeof patrons>;

export const patronRelations = relations(patrons, ({ many, one }) => ({
  checkouts: many(checkouts),
  groups: many(patronGroupAssignments),
  holds: many(holds),
  organization: one(organizations, {
    fields: [patrons.organizationId],
    references: [organizations.id],
  }),
}));

export const patronGroups = pgTable(
  "patron_group",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    name: text("name").notNull(),
    oneRosterSourcedId: text("one_roster_sourced_id"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
  },
  (t) => ({
    id_by_organization: uniqueIndex().on(t.id, t.organizationId),
    name_by_organization: uniqueIndex().on(t.name, t.organizationId),
    one_roster_id_by_org: uniqueIndex().on(
      t.oneRosterSourcedId,
      t.organizationId
    ),
  })
);

export type PatronGroup = InferSelectModel<typeof patronGroups>;

export const patronGroupRelations = relations(
  patronGroups,
  ({ many, one }) => ({
    libraryPolicyAssignments: many(patronGroupLibraryPolicyAssignments),
    organization: one(organizations, {
      fields: [patronGroups.organizationId],
      references: [organizations.id],
    }),
    patrons: many(patronGroupAssignments),
  })
);

export const patronGroupAssignments = pgTable(
  "patron_group_assignment",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    groupId: text("group_id").notNull(),
    oneRosterSourcedId: text("one_roster_sourced_id"),
    organizationId: text("organization_id").notNull(),
    patronId: text("patron_id").notNull(),
  },
  (t) => ({
    one_roster_id_by_org: uniqueIndex().on(
      t.oneRosterSourcedId,
      t.organizationId
    ),
    org_group: foreignKey({
      columns: [t.organizationId, t.groupId],
      foreignColumns: [patronGroups.organizationId, patronGroups.id],
    }),
    org_patron: foreignKey({
      columns: [t.organizationId, t.patronId],
      foreignColumns: [patrons.organizationId, patrons.id],
    }),
  })
);

export type PatronGroupAssignment = InferSelectModel<
  typeof patronGroupAssignments
>;

export const patronGroupAssignmentRelations = relations(
  patronGroupAssignments,
  ({ one }) => ({
    group: one(patronGroups, {
      fields: [
        patronGroupAssignments.organizationId,
        patronGroupAssignments.groupId,
      ],
      references: [patronGroups.organizationId, patronGroups.id],
    }),
    patron: one(patrons, {
      fields: [
        patronGroupAssignments.organizationId,
        patronGroupAssignments.patronId,
      ],
      references: [patrons.organizationId, patrons.id],
    }),
  })
);

export const patronGroupLibraryPolicyAssignments = pgTable(
  "patron_group_library_policy_assignment",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    groupId: text("group_id").notNull(),
    libraryId: text("library_id").notNull(),
    organizationId: text("organization_id").notNull(),
    policyId: text("policy_id").notNull(),
  },
  (t) => ({
    group_org: foreignKey({
      columns: [t.groupId, t.organizationId],
      foreignColumns: [patronGroups.id, patronGroups.organizationId],
    }),
    library_org: foreignKey({
      columns: [t.libraryId, t.organizationId],
      foreignColumns: [libraries.id, libraries.organizationId],
    }),
    library_policy: foreignKey({
      columns: [t.libraryId, t.policyId],
      foreignColumns: [
        libraryPatronPolicies.libraryId,
        libraryPatronPolicies.id,
      ],
    }),
    primary_key: primaryKey({ columns: [t.groupId, t.policyId] }),
  })
);

export type PatronGroupLibraryPolicyAssignment = InferSelectModel<
  typeof patronGroupLibraryPolicyAssignments
>;

export const patronGroupLibraryPolicyAssignmentRelations = relations(
  patronGroupLibraryPolicyAssignments,
  ({ one }) => ({
    group: one(patronGroups, {
      fields: [
        patronGroupLibraryPolicyAssignments.groupId,
        patronGroupLibraryPolicyAssignments.organizationId,
      ],
      references: [patronGroups.id, patronGroups.organizationId],
    }),
    library: one(libraries, {
      fields: [
        patronGroupLibraryPolicyAssignments.libraryId,
        patronGroupLibraryPolicyAssignments.organizationId,
      ],
      references: [libraries.id, libraries.organizationId],
    }),
    organization: one(organizations, {
      fields: [patronGroupLibraryPolicyAssignments.organizationId],
      references: [organizations.id],
    }),
    policy: one(libraryPatronPolicies, {
      fields: [
        patronGroupLibraryPolicyAssignments.libraryId,
        patronGroupLibraryPolicyAssignments.policyId,
      ],
      references: [libraryPatronPolicies.libraryId, libraryPatronPolicies.id],
    }),
  })
);

export const patronImports = pgTable(
  "patron_import",
  {
    classesFileKey: text("classes_file_key"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    demographicsFileKey: text("demographics_file_key"),
    enrollmentsFileKey: text("enrollments_file_key"),
    id: text("id").primaryKey().default(defaultUUID),
    organizationId: text("organization_id").notNull(),
    syncId: text("sync_id").notNull(),
    usersFileKey: text("users_file_key"),
  },
  (t) => ({
    org_sync: foreignKey({
      columns: [t.organizationId, t.syncId],
      foreignColumns: [patronSyncs.organizationId, patronSyncs.id],
    }),
  })
);

export type PatronImport = InferSelectModel<typeof patronImports>;

export const patronImportRelations = relations(patronImports, ({ one }) => ({
  organization: one(organizations, {
    fields: [patronImports.organizationId],
    references: [organizations.id],
  }),
  sync: one(patronSyncs, {
    fields: [patronImports.organizationId, patronImports.syncId],
    references: [patronSyncs.organizationId, patronSyncs.id],
  }),
}));

export const patronQueries = pgTable(
  "patron_query",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    id: text("id").primaryKey().default(defaultUUID),
    name: text("name").notNull(),
    organizationId: text("organization_id").notNull(),
    ownerId: text("owner_id").notNull(),
    query: json("query").$type<PatronQueryJson>().notNull(),
    type: text("type", { enum: ["PRIVATE", "SHARED"] })
      .notNull()
      .default("PRIVATE"),
  },
  (t) => ({
    org_user: foreignKey({
      columns: [t.organizationId, t.ownerId],
      foreignColumns: [
        organizationUsers.organizationId,
        organizationUsers.userId,
      ],
    }),
  })
);

export type PatronQuery = InferSelectModel<typeof patronQueries>;

export const patonQueryRelations = relations(patronQueries, ({ one }) => ({
  organization: one(organizations, {
    fields: [patronQueries.organizationId],
    references: [organizations.id],
  }),
  user: one(organizationUsers, {
    fields: [patronQueries.organizationId, patronQueries.ownerId],
    references: [organizationUsers.organizationId, organizationUsers.userId],
  }),
}));

export const patronSyncs = pgTable(
  "patron_sync",
  {
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    groupsAdded: integer("groups_added").notNull(),
    groupsDeleted: integer("groups_deleted").notNull(),
    groupsUpdated: integer("groups_updated").notNull(),
    id: text("id").primaryKey().default(defaultUUID),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    patronGroupAssignmentsAdded: integer(
      "patron_group_assignments_added"
    ).notNull(),
    patronGroupAssignmentsDeleted: integer(
      "patron_group_assignments_deleted"
    ).notNull(),
    patronsAdded: integer("patrons_added").notNull(),
    patronsDeleted: integer("patrons_deleted").notNull(),
    patronsUpdated: integer("patrons_updated").notNull(),
    status: text("status", {
      enum: ["PENDING", "PARSING", "COMPLETE", "FAILED"],
    }).default("PENDING"),
  },
  (t) => ({
    id_by_org: uniqueIndex().on(t.id, t.organizationId),
  })
);

export type PatronSync = InferSelectModel<typeof patronSyncs>;

export const patronSyncRelations = relations(patronSyncs, ({ one }) => ({
  organization: one(organizations, {
    fields: [patronSyncs.organizationId],
    references: [organizations.id],
  }),
}));
