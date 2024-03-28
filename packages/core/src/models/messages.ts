import { z } from "zod";

export const marcFileMessageSchema = z.object({
  bucketName: z.string(),
  fileKey: z.string(),
  importId: z.string(),
  libraryId: z.string(),
});
export type MarcFileMessage = z.infer<typeof marcFileMessageSchema>;

export const bookEmbeddingMessageSchema = z.object({
  bookIds: z.array(z.string()),
});
export type BookEmbeddingMessage = z.infer<typeof bookEmbeddingMessageSchema>;
