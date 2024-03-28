import {
  DataField,
  DataFieldTag,
  MarcRecord,
  SubfieldKey,
} from "@stacks-ils-ion/core/models";
import { Iso2709ParserChunk } from "@stacks-ils-ion/core/marc";
import { ProcessedData, ProcessedRecord } from "./types";

export function parseRecord(chunk: Iso2709ParserChunk): ProcessedData {
  if (chunk.error) {
    return {
      raw: chunk.raw,
    };
  }

  return {
    parsed: {
      authors: getAuthors(chunk.record),
      copies: getCopies(chunk.record),
      isbn_10: getIsbn10(chunk.record),
      isbn_13: getIsbn13(chunk.record),
      page_count: getPageCount(chunk.record),
      published_year: getPublishedYear(chunk.record),
      publisher_name: getPublisherName(chunk.record),
      readingPrograms: getReadingPrograms(chunk.record),
      reading_grade: getReadingGrade(chunk.record),
      record: chunk.record,
      series_entry: getSeriesEntry(chunk.record),
      series_name: getSeriesName(chunk.record),
      summary: getSummary(chunk.record),
      target_age_max: getTargetAgeMax(chunk.record),
      target_age_min: getTargetAgeMin(chunk.record),
      title: getTitle(chunk.record),
      topics: getTopics(chunk.record),
    },
    raw: chunk.raw,
  };
}

const DEFAULT_TEXT = "[Unknown]";

function getAuthors(record: MarcRecord): ProcessedRecord["authors"] {
  const list = [];
  const primaryAuthor = firstDataField(record, "100");
  let count = 0;
  if (primaryAuthor) {
    const data = parseAuthor(primaryAuthor, count);
    if (data.name) {
      list.push(data);
      count++;
    }
  }
  for (const field of record.dataFields[700] || []) {
    const data = parseAuthor(field, count);
    if (data.name) {
      list.push(data);
      count++;
    }
  }

  return list;
}

function parseAuthor(
  field: DataField,
  index: number
): ProcessedRecord["authors"][number] {
  const name = cleanProperName(
    `${firstSubfield(field, "c") ? `${firstSubfield(field, "c")} ` : ""}${
      firstSubfield(field, "a") ? firstSubfield(field, "a") : ""
    }${firstSubfield(field, "b") ? ` ${firstSubfield(field, "b")}` : ""}`
  );
  const relation = field.subfields.e?.map(cleanRelation).join(", ");
  return {
    index,
    name,
    relation,
  };
}

function getCopies(record: MarcRecord): ProcessedRecord["copies"] {
  return (
    record.dataFields["852"]?.map((field) => ({
      barcode: firstSubfield(field, "p") || undefined,
      call_number: [
        firstSubfield(field, "k"),
        firstSubfield(field, "h"),
        firstSubfield(field, "i"),
      ]
        .filter(Boolean)
        .join(" "),
      location: firstSubfield(field, "c") || undefined,
    })) || []
  );
}

function getIsbn10(record: MarcRecord): string | undefined {
  const isbnFields = record.dataFields["020"] || [];
  const value = isbnFields
    .find((f) => f.subfields["a"]?.some((a) => cleanISBN10(a).length === 10))
    ?.subfields?.a?.find((a) => cleanISBN10(a).length === 10);
  return value && cleanISBN10(value);
}

function cleanISBN10(input: string) {
  return input.replace(/[^\dX]/g, "");
}

function getIsbn13(record: MarcRecord): string | undefined {
  const isbnFields = record.dataFields["020"] || [];
  const value = isbnFields
    .find((f) => f.subfields["a"]?.some((a) => cleanISBN13(a).length === 13))
    ?.subfields?.a?.find((a) => cleanISBN13(a).length === 13);
  return value && cleanISBN13(value);
}

function cleanISBN13(input: string) {
  return input.replace(/\D/g, "");
}

function getPageCount(record: MarcRecord): number | undefined {
  const pageCount = firstDataSubfield(record, "300", "a");
  return pageCount ? parsePageCountFromString(pageCount) : undefined;
}

function parsePageCountFromString(pageCount: string): number | undefined {
  // A string of digits at some point followed by a word (or letter) beginning with "p".
  const match = pageCount.match(/(\d+).*(?<!\w)p/);
  if (match?.[1]) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

function getPublishedYear(record: MarcRecord): number | undefined {
  const publishedDate = firstDataSubfield(record, "260", "c");
  return publishedDate ? cleanPublishedDate(publishedDate) : undefined;
}

function cleanPublishedDate(date: string): number | undefined {
  const match = date.match(/\d{4}/)?.[0];
  return match ? parseInt(match, 10) : undefined;
}

function getPublisherName(record: MarcRecord): string | undefined {
  const publisher = firstDataSubfield(record, "260", "b");
  return publisher && cleanProperName(publisher);
}

function getReadingGrade(record: MarcRecord): number | undefined {
  return _parseFloat(
    record.dataFields["521"]?.find((field) => field.ind1 === "0")?.subfields[
      "a"
    ]?.[0]
  );
}

function getReadingPrograms(
  record: MarcRecord
): ProcessedRecord["readingPrograms"] {
  return (record.dataFields["526"] || []).reduce<
    ProcessedRecord["readingPrograms"]
  >((acc, field) => {
    const name = field.subfields.a?.[0];
    if (name) {
      acc.push({
        name,
        note: field.subfields.z?.[0],
        point_value: _parseFloat(field.subfields.d?.[0]),
        reading_level: _parseFloat(field.subfields.c?.[0]),
      });
    }
    return acc;
  }, []);
}

function getSeriesEntry(record: MarcRecord): string | undefined {
  return firstDataSubfield(record, "490", "v");
}

function getSeriesName(record: MarcRecord): string | undefined {
  const seriesFieldValue = firstDataSubfield(record, "490", "a");
  return seriesFieldValue && cleanAndFormatTitle(seriesFieldValue);
}

function getSummary(record: MarcRecord): string | undefined {
  const summary = firstDataSubfield(record, "520", "a");
  return summary && cleanSummary(summary);
}

function cleanSummary(summary: string) {
  const match = cleanUnicode(summary)
    .trim()
    .match(/^"(.+)"(\s*--?.*)?$/);
  if (match?.[1]) {
    return match[1].replace(/\.?$/, ".");
  }
  return summary;
}

function getTargetAgeMax(record: MarcRecord): number | undefined {
  const value = record.dataFields["521"]?.find((field) => field.ind1 === "1")
    ?.subfields["a"]?.[0];
  const match = value?.match(/(\d+)(?:\D+(\d+))?/);
  return match && match[2] ? parseInt(match[2], 10) : undefined;
}

function getTargetAgeMin(record: MarcRecord): number | undefined {
  const value = record.dataFields["521"]?.find((field) => field.ind1 === "1")
    ?.subfields["a"]?.[0];
  const match = value?.match(/(\d+)(?:\D+(\d+))?/);
  return match && match[1] ? parseInt(match[1], 10) : undefined;
}

function getTitle(record: MarcRecord): string {
  const titleFieldValue = firstDataSubfield(record, "245", "a");
  const title = cleanAndFormatTitle(titleFieldValue || "");
  const subtitle = parseSubtitle(record);

  if (title) {
    if (subtitle) {
      return `${title}: ${subtitle}`;
    }
    return title;
  }
  if (subtitle) {
    return subtitle;
  }

  return DEFAULT_TEXT;
}

function parseSubtitle(record: MarcRecord) {
  const titleFieldValue = firstDataSubfield(record, "245", "b");
  return titleFieldValue && cleanAndFormatTitle(titleFieldValue);
}

function getTopics(record: MarcRecord): string[] {
  const topicFields = record.dataFields["650"] || [];
  return Array.from(
    new Set(
      topicFields
        .filter((f) => f.subfields["a"]?.length)
        .flatMap((f) => (f.subfields.a || []).map(cleanProperName))
    )
  );
}

function firstDataField(marc: MarcRecord, tag: DataFieldTag) {
  return marc.dataFields[tag]?.[0];
}

function firstSubfield(field: DataField, key: SubfieldKey) {
  return field.subfields[key]?.[0];
}

function firstDataSubfield(
  marc: MarcRecord,
  tag: DataFieldTag,
  key: SubfieldKey
) {
  return marc.dataFields[tag]?.[0].subfields?.[key]?.[0];
}

function cleanProperName(name: string) {
  return cleanUnicode(name)
    .trim()
    .replace(/,$/, "")
    .replace(/(?<=[a-z])\.$/, "")
    .trim();
}

function cleanUnicode(input: string) {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    if (
      input.charCodeAt(i) <= 127 ||
      (input.charCodeAt(i) >= 160 && input.charCodeAt(i) <= 255)
    ) {
      output += input.charAt(i);
    }
  }
  return output;
}

function cleanRelation(value: string): string {
  return cleanUnicode(value).trim().replace(/[,.]/, "").trim();
}

function _parseFloat(str: string | undefined): number | undefined {
  const match = str?.match(/\d+(\.\d+)?/)?.[0];
  return match ? parseFloat(match) : undefined;
}

const articles = ["the", "a", "an"];
const prepositions = [
  "at",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "to",
  "with",
];
const conjunctions = ["and", "but", "or", "nor", "so"];

function cleanAndFormatTitle(marcTitle: string) {
  const trimmed = cleanUnicode(marcTitle)
    .trim()
    .replace(/\/\s*$/, "")
    .replace(/;\s*$/, "")
    .replace(/:\s*$/, "")
    .replace(/\.\s*$/, "")
    .trim();
  return trimmed
    .split(" ")
    .map((word, i) =>
      i === 0
        ? capitalize(word)
        : [...articles, ...prepositions, ...conjunctions].includes(word)
        ? word
        : capitalize(word)
    )
    .join(" ");
}

function capitalize(word: string) {
  return `${word[0]?.toUpperCase() || ""}${word.slice(1)}`;
}
