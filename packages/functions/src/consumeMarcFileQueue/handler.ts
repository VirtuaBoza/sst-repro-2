import { SQSHandler } from "aws-lambda";
import { marcFileMessageSchema } from "@stacks-ils-ion/core/models";
import { processMessage } from "./processMessage";

export const main: SQSHandler = async (_evt) => {
  for await (const record of _evt.Records) {
    try {
      const message = marcFileMessageSchema.parse(JSON.parse(record.body));
      await processMessage(message);
    } catch (err) {
      console.error(err);
    }
  }
};
