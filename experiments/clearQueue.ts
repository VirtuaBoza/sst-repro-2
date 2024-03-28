import { SQS } from "@aws-sdk/client-sqs";
import { Resource } from "sst";

const sqs = new SQS();

await sqs.purgeQueue({
  QueueUrl: Resource.BookEmbeddingQueue.url,
});
