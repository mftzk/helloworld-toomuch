// app/api/counter/route.js
// A deliberately tiny in-memory visit counter.
//
// NOTE: the counter lives in module-level memory, so it resets whenever the
// process restarts (i.e. on every redeploy). That is expected and documented
// in the README. It is a demo, not a database.

export const dynamic = "force-dynamic";

let visits = 0;

function payload() {
  return {
    visits,
    note: "in-memory counter — resets on redeploy",
    timestamp: new Date().toISOString(),
  };
}

function headers() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

export async function GET() {
  return Response.json(payload(), { headers: headers() });
}

export async function POST() {
  visits += 1;
  return Response.json(payload(), { status: 201, headers: headers() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: headers() });
}
