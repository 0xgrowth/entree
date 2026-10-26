import type { VercelRequest, VercelResponse } from "@vercel/node";
import { redis } from "../src/redis";

export default async function handler(
    _req: VercelRequest,
    res: VercelResponse,
) {
    try {
        await redis.ping();

        return res.status(200).json({
            ok: true,
            service: "entry-management-api",
            redis: "connected",
        });
    } catch {
        return res.status(503).json({
            ok: false,
            error: "Redis unavailable",
        });
    }
}