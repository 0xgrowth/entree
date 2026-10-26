import { z } from "zod";

export const createEntrySchema = z.object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(5000),
});

export const createNoteSchema = z.object({
    content: z.string().trim().min(1).max(2000),
});