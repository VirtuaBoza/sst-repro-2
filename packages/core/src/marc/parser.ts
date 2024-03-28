import {
  ControlFieldTag,
  DataFieldTag,
  IndicatorValue,
  MarcRecord,
  marcRecordSchema,
} from "../models/index.js";
import { Readable, Transform } from "node:stream";

const RS = "\x1e"; // Field terminator
const US = "\x1f"; // Delimiter
const GS = "\x1d"; // Record terminator

export type Iso2709ParserChunk =
  | {
      error: Error;
      raw: string;
      record: null;
    }
  | {
      error: null;
      raw: string;
      record: MarcRecord;
    };

/**
 * A simple ISO2709 parser that emits parsed records as MarcToolsJson.
 */
export class Iso2709Parser extends Transform {
  private buffer = "";

  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: false,
    });
  }

  _transform(
    chunk: Buffer,
    encoding: string,
    callback: (err?: Error | null, data?: any) => void
  ) {
    this.buffer += chunk.toString();

    while (this.buffer.length > 0) {
      const end = this.buffer.indexOf(GS);
      if (end !== -1) {
        const raw = this.buffer.slice(0, end);
        this.buffer = this.buffer.slice(end + 1);
        try {
          const record = Iso2709Parser.parseRecord(raw);
          this.push({
            error: null,
            raw,
            record,
          } satisfies Iso2709ParserChunk);
        } catch (err) {
          console.error("Failed", { raw });
          const error = err instanceof Error ? err : new Error(String(err));
          this.push({ error, raw, record: null } satisfies Iso2709ParserChunk);
        }
      } else {
        return callback();
      }
    }

    callback();
  }

  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (chunk: Iso2709ParserChunk) => void): this;
  on(event: "drain", listener: () => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "finish", listener: () => void): this;
  on(event: "pause", listener: () => void): this;
  on(event: "pipe", listener: (src: Readable) => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "resume", listener: () => void): this;
  on(event: "unpipe", listener: (src: Readable) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void) {
    return super.on(event, listener);
  }

  static parseRecord(rawRecord: string): MarcRecord {
    const leader = rawRecord.slice(0, 24);
    const lengthOfFieldLength = parseInt(leader.slice(20, 21), 10);
    const lengthOfStartingCharacterPosition = parseInt(
      leader.slice(21, 22),
      10
    );

    const rawDirectory = rawRecord.slice(24, rawRecord.indexOf(RS));
    const rawFields = rawRecord.slice(rawRecord.indexOf(RS) + 1).split(RS);

    const directory =
      rawDirectory.match(
        new RegExp(
          `\\d{${3 + lengthOfFieldLength + lengthOfStartingCharacterPosition}}`,
          "g"
        )
      ) || [];

    const fieldOrder = directory
      .map((entry) => ({
        offset: parseInt(entry.slice(3 + lengthOfFieldLength), 10),
        tag: entry.slice(0, 3),
      }))
      .sort((a, b) => a.offset - b.offset)
      .map((entry) => entry.tag);

    if (fieldOrder.length !== rawFields.length - 1) {
      throw new Error(
        `Field count mismatch: ${fieldOrder.length} fields in directory, ${
          rawFields.length - 1
        } in record`
      );
    }

    const fields = fieldOrder.reduce(
      (acc, tag, i) => {
        if (/^00[1-9]$/.test(tag)) {
          acc.controlFields[tag as ControlFieldTag] = rawFields[i];
          return acc;
        }

        if (!acc.dataFields[tag as DataFieldTag]) {
          acc.dataFields[tag as DataFieldTag] = [];
        }

        const [indicators, ...rawSubFields] = rawFields[i].split(US);
        const subfields = rawSubFields.reduce((a, s) => {
          const code = s.charAt(0);
          if (!a[code]) {
            a[code] = [];
          }
          a[code].push(s.slice(1));
          return a;
        }, {} as Record<string, string[]>);

        acc.dataFields[tag as DataFieldTag]!.push({
          ind1: indicators[0] as IndicatorValue,
          ind2: indicators[1] as IndicatorValue,
          subfields,
        });

        return acc;
      },
      {
        controlFields: {},
        dataFields: {},
      } as Omit<MarcRecord, "leader">
    );

    return marcRecordSchema.parse({ leader, ...fields });
  }
}
