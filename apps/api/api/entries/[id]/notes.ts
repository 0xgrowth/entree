import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import {
    redis,
    entryKey,
    notesKey,
    type Entry,
    type Note,
} from "../../../src/redis";
import { createNoteSchema } from "../../../src/validation";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const entryId = String(req.query.id ?? "");

    if (!entryId) {
        return res.status(400).json({ error: "Entry ID required" });
    }

    try {
        if (req.method === "GET") {
            const entry = await redis.get<Entry>(entryKey(entryId));

            if (!entry) {
                return res.status(404).json({ error: "Entry not found" });
            }

            const notes = await redis.lrange<Note>(
                notesKey(entryId),
                0,
                99,
            );

            return res.status(200).json({ notes });
        }

        if (req.method === "POST") {
            const parsed = createNoteSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    error: "Invalid note",
                    details: parsed.error.flatten(),
                });
            }

            const entryExists = await redis.exists(entryKey(entryId));

            if (!entryExists) {
                return res.status(404).json({ error: "Entry not found" });
            }

            const note: Note = {
                id: randomUUID(),
                entryId,
                content: parsed.data.content,
                createdAt: new Date().toISOString(),
            };

            await redis.lpush(notesKey(entryId), note);
            return res.status(201).json({ note });
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("Notes API error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}