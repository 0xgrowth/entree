import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
    redis,
    entryKey,
    notesKey,
    type Entry,
} from "../../src/redis";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const id = String(req.query.id ?? "");

    if (!id) {
        return res.status(400).json({ error: "Entry ID required" });
    }

    try {
        if (req.method === "GET") {
            const entry = await redis.get<Entry>(entryKey(id));

            if (!entry) {
                return res.status(404).json({ error: "Entry not found" });
            }

            const notes = await redis.lrange(
                notesKey(id),
                0,
                99,
            );

            return res.status(200).json({ entry, notes });
        }

        if (req.method === "DELETE") {
            const entry = await redis.get<Entry>(entryKey(id));

            if (!entry) {
                return res.status(404).json({ error: "Entry not found" });
            }

            await redis.del(entryKey(id), notesKey(id));
            await redis.srem("entries:ids", id);

            return res.status(200).json({ ok: true });
        }

        res.setHeader("Allow", "GET, DELETE");
        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("Entry detail API error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}