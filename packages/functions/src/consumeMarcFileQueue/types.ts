import { MarcRecord } from "@stacks-ils-ion/core/models";

export interface ProcessedRecord {
  authors: Array<{
    index: number;
    name: string;
    relation: string | undefined;
  }>;
  copies: Array<{
    barcode: string | undefined;
    call_number: string | undefined;
    location: string | undefined;
  }>;
  isbn_10: string | undefined;
  isbn_13: string | undefined;
  page_count: number | undefined;
  published_year: number | undefined;
  publisher_name: string | undefined;
  readingPrograms: Array<{
    name: string;
    note: string | undefined;
    point_value: number | undefined;
    reading_level: number | undefined;
  }>;
  reading_grade: number | undefined;
  record: MarcRecord;
  series_entry: string | undefined;
  series_name: string | undefined;
  summary: string | undefined;
  target_age_max: number | undefined;
  target_age_min: number | undefined;
  title: string;
  topics: string[];
}

export interface ProcessedData {
  parsed?: ProcessedRecord;
  raw: string;
}
