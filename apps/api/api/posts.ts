
export default {
  async fetch(request: Request) {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );

      if (!response.ok) {
        return Response.json(
          { error: "Failed to fetch posts" },
          { status: 502 }
        );
      }

      const posts = await response.json();

      return Response.json(posts);
    } catch {
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
};
