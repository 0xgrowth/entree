import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export type Entry = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
};

export type Note = {
    id: string;
    entryId: string;
    content: string;
    createdAt: string;
};

export const entryKey = (id: string) => `entry:${id}`;
export const notesKey = (id: string) => `entry:${id}:notes`;