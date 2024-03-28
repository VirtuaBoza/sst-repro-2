import { bookEmbeddingMessageSchema } from "@stacks-ils-ion/core/models";
import { processMessage } from "./processMessage.js";
import type { SQSHandler } from "aws-lambda";

export const main: SQSHandler = async (event) => {
  for await (const record of event.Records) {
    try {
      const message = bookEmbeddingMessageSchema.parse(JSON.parse(record.body));
      await processMessage(message);
    } catch (err) {
      console.error(err);
    }
  }
};
