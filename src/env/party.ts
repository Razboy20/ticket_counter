import { z } from "zod";

export const InfoMessage = z.object({ type: z.literal("info"), ticket: z.number(), total: z.number() });
export const UpdateMessage = z.object({ type: z.literal("update"), total: z.number() });
export const Message = z.union([InfoMessage, UpdateMessage]);
