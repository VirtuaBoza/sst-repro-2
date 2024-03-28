import { z } from "zod";

export const SINGLE_DIGIT_STRINGS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;
export type SingleDigitString = (typeof SINGLE_DIGIT_STRINGS)[number];

export const SINGLE_LOWERCASE_LETTERS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
] as const;
export type SingleLowercaseLetter = (typeof SINGLE_LOWERCASE_LETTERS)[number];

export type ControlFieldTag = `00${Exclude<SingleDigitString, "0">}`;
export const controlFieldTagSchema = z
  .string()
  .length(3)
  .regex(/^00[1-9]$/) as z.ZodType<ControlFieldTag>;

export type DataFieldTag =
  | `${SingleDigitString}${Exclude<SingleDigitString, "0">}${SingleDigitString}`
  | `${Exclude<
      SingleDigitString,
      "0"
    >}${SingleDigitString}${SingleDigitString}`;
export const dataFieldTagSchema = z
  .string()
  .length(3)
  .regex(/^([0-9][1-9][0-9]|[1-9][0-9]{2})$/) as z.ZodType<DataFieldTag>;

const subfieldKeySchema = z.enum([
  ...SINGLE_DIGIT_STRINGS,
  ...SINGLE_LOWERCASE_LETTERS,
]);
export type SubfieldKey = z.infer<typeof subfieldKeySchema>;

const indicatorSchema = z.enum([
  " ",
  ...SINGLE_DIGIT_STRINGS,
  ...SINGLE_LOWERCASE_LETTERS,
]);
export type IndicatorValue = z.infer<typeof indicatorSchema>;

const controlFieldsSchema = z.record(controlFieldTagSchema, z.string());
export type ControlField = z.infer<typeof controlFieldsSchema>;

const subfieldsSchema = z.record(subfieldKeySchema, z.array(z.string()));
export type Subfields = z.infer<typeof subfieldsSchema>;

const dataFieldSchema = z.object({
  ind1: indicatorSchema,
  ind2: indicatorSchema,
  subfields: subfieldsSchema,
});
export type DataField = z.infer<typeof dataFieldSchema>;

const dataFieldsSchema = z.record(dataFieldTagSchema, z.array(dataFieldSchema));
export type DataFields = z.infer<typeof dataFieldsSchema>;

export const marcRecordSchema = z.object({
  controlFields: controlFieldsSchema,
  dataFields: dataFieldsSchema,
  leader: z.string().length(24),
});
export type MarcRecord = z.infer<typeof marcRecordSchema>;
