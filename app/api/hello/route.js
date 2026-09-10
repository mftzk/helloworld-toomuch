// app/api/hello/route.js
// The main endpoint. Translates a greeting, then throws in a fortune, a fact,
// a lucky number and some process metadata. CORS is wide open on purpose.

import { GREETINGS, findGreeting, publicGreetings } from "../../../lib/greetings";

export const dynamic = "force-dynamic";

const FORTUNES = [
  "A mysterious stranger will introduce themselves in a language you do not speak.",
  "Today is a great day to delete some code.",
  "Your next `git push` will be celebrated by at least one CI runner.",
  "A semicolon you forgot will be forgiven.",
  "You will soon meet a bug that only happens on Tuesdays.",
  "Someone, somewhere, is about to say hello to you.",
  "The cache you invalidate today will save you tomorrow.",
  "An off-by-one error is quietly reconsidering its life choices.",
  "Your pull request will be reviewed faster than you expect.",
  "A green build is in your near future.",
  "You will discover that the answer was in the logs all along.",
  "A wild feature request will appear. You will tame it.",
  "The best time to write a test was yesterday. The second best is now.",
  "You will say 'hello world' and the world will say it back.",
  "Beware of premature optimisation. Also beware of Tuesdays.",
  "A rubber duck will guide you to the answer.",
  "Your code will compile on the first try. Probably.",
  "An undocumented environment variable will reveal itself.",
  "You will finally close that tab from 2019.",
  "A tiny hello today becomes a giant hello tomorrow.",
];

const FACTS = [
  "The first 'Hello, World!' program was popularized by Brian Kernighan in 1972.",
  "'Hello, World!' has been written in well over 500 programming languages.",
  "In some languages, printing 'Hello, World!' is a single character of code.",
  "The phrase appears in the 1974 Bell Labs tutorial 'Programming in C: A Tutorial'.",
  "A 'Hello, World!' program is often the smallest thing a compiler can verify.",
  "The Apollo 11 guidance computer had less memory than a single Hello World web page.",
  "There are an estimated 7000+ living human languages; this app speaks 63.",
  "The word 'hello' only became a common greeting after the invention of the telephone.",
  "In JavaScript, 'Hello World' can be printed as console.log`Hello World`.",
  "'Hello, World!' is frequently used as a smoke test for new toolchains.",
  "Some esoteric languages require 'Hello, World!' to be written as a work of art.",
  "The very first computer bug was an actual moth, found in 1947.",
  "UTF-8 can encode every greeting in this app, including emoji flags.",
  "A 'Hello, World!' program is one of the few programs that is provably correct.",
  "In 2014, researchers printed 'Hello, World!' using DNA molecules.",
  "The shortest known C 'Hello, World!' is only a few dozen bytes.",
  "Every language in this app greets you in roughly the same spirit.",
  "'Hola', 'Bonjour' and 'Ciao' all trace their warmth back centuries.",
  "The Web Audio API used by this page has no external dependencies at all.",
  "Confetti physics is just velocity plus gravity, every single time.",
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

export async function GET(request) {
  const params = request.nextUrl.searchParams;

  const rawName = params.get("name");
  const name =
    rawName && rawName.trim().length > 0
      ? rawName.trim().slice(0, 100)
      : "World";

  const requestedLang = (params.get("lang") || "en").toLowerCase();
  const match = findGreeting(requestedLang) || GREETINGS[0];

  const wantsAll = params.get("all") === "1";

  const body = {
    greeting: match.text,
    message: `${match.text}, ${name}!`,
    language: match.language,
    code: match.code,
    name,
    fortune: pick(FORTUNES),
    fact: pick(FACTS),
    luckyNumber: Math.floor(Math.random() * 999) + 1,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Number(process.uptime().toFixed(3)),
    powered_by: "nrapken.dev",
  };

  // `?all=1` returns every greeting, for the truly thorough visitor.
  if (wantsAll) {
    body.greetings = publicGreetings();
    body.greetingCount = GREETINGS.length;
  }

  return Response.json(body, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
