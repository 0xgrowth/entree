import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { redis, entryKey, type Entry } from "../../src/redis";
import { createEntrySchema } from "../../src/validation";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    try {
        if (req.method === "GET") {
            const ids = await redis.smembers("entries:ids");

            const entries = (
                await Promise.all(
                    ids.map((id) => redis.get<Entry>(entryKey(String(id)))),
                )
            )
                .filter((entry): entry is Entry => entry !== null)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

            return res.status(200).json({ entries });
        }

        if (req.method === "POST") {
            const parsed = createEntrySchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    error: "Invalid entry",
                    details: parsed.error.flatten(),
                });
            }

            const entry: Entry = {
                id: randomUUID(),
                ...parsed.data,
                createdAt: new Date().toISOString(),
            };

            await redis.set(entryKey(entry.id), entry);
            await redis.sadd("entries:ids", entry.id);

            return res.status(201).json({ entry });
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("Entries API error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}