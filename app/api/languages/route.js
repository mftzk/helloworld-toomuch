// app/api/languages/route.js
// Returns every greeting this app knows about: { code, language, text }.

import { publicGreetings } from "../../../lib/greetings";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(publicGreetings(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
