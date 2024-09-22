import { duffel } from "@/lib/travel/duffel";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";

    if (!name) {
      return Response.json(
        { error: "The 'name' parameter is required" },
        { status: 400 },
      );
    }

    const response = await duffel.suggestions.list({
      query: name,
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
