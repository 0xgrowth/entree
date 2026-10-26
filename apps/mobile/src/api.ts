const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

async function request<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    if (!API_URL) {
        throw new Error("Missing EXPO_PUBLIC_API_URL");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });

    const body = await response.json();

    if (!response.ok) {
        throw new Error(body.error ?? "Request failed");
    }

    return body as T;
}

export const api = {
    listEntries: () =>
        request<{ entries: Entry[] }>("/entries"),

    getEntry: (id: string) =>
        request<{ entry: Entry; notes: Note[] }>(
            `/entries/${encodeURIComponent(id)}`,
        ),

    createEntry: (title: string, content: string) =>
        request<{ entry: Entry }>("/entries", {
            method: "POST",
            body: JSON.stringify({ title, content }),
        }),

    createNote: (id: string, content: string) =>
        request<{ note: Note }>(
            `/entries/${encodeURIComponent(id)}/notes`,
            {
                method: "POST",
                body: JSON.stringify({ content }),
            },
        ),
};