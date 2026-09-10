// app/api/health/route.js
// Simple liveness/readiness probe. Always open CORS so anyone can poll it.

export const dynamic = "force-dynamic";

export async function GET() {
  const body = {
    status: "ok",
    service: "helloworld-toomuch",
    uptimeSeconds: Number(process.uptime().toFixed(3)),
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
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
