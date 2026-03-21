import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { decisions, thesisChallenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { decisionId } = await req.json();
  if (!decisionId) {
    return NextResponse.json({ error: "decisionId is required" }, { status: 400 });
  }

  // Verify decision belongs to user
  const [decision] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, decisionId), eq(decisions.userId, userId)));

  if (!decision) {
    return NextResponse.json({ error: "Decision not found" }, { status: 404 });
  }

  const assumptions = decision.keyAssumptions
    ? (JSON.parse(decision.keyAssumptions) as string[])
    : [];

  const prompt = `You are a sharp, direct devil's advocate for investment decisions. Your job is to challenge the thesis below with specific, high-quality counterarguments — not generic warnings.

INVESTMENT THESIS:
Title: ${decision.title}
Thesis: ${decision.thesis}
${assumptions.length > 0 ? `Key assumptions the investor stated:\n${assumptions.map((a, i) => `${i + 1}. ${a}`).join("\n")}` : ""}
${decision.expectedOutcome ? `Expected outcome: ${decision.expectedOutcome}` : ""}
${decision.premortemAnswer ? `If this fails, investor thinks: ${decision.premortemAnswer}` : ""}

Respond in JSON with this exact structure:
{
  "strongestCounterArguments": [
    "specific counter-argument 1 referencing the investor's own claims",
    "specific counter-argument 2",
    "specific counter-argument 3"
  ],
  "implicitAssumptions": [
    "assumption the investor made but didn't state 1",
    "assumption 2"
  ],
  "clarifyingQuestion": "One hard question the investor probably hasn't answered"
}

Rules:
- Each counterargument MUST reference specific language or claims from the thesis
- "Have you considered competition?" is failure. Name the specific competitive risk their thesis implies.
- Implicit assumptions must be genuinely unstated — do not repeat what they already wrote
- The clarifying question must be uncomfortable and specific
- Be collegial but merciless`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
  }

  let parsed: {
    strongestCounterArguments: string[];
    implicitAssumptions: string[];
    clarifyingQuestion: string;
  };

  try {
    // Strip markdown code fences if present
    const raw = content.text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const [challenge] = await db
    .insert(thesisChallenges)
    .values({
      decisionId,
      strongestCounterArguments: JSON.stringify(parsed.strongestCounterArguments),
      implicitAssumptions: JSON.stringify(parsed.implicitAssumptions),
      clarifyingQuestion: parsed.clarifyingQuestion,
    })
    .returning();

  return NextResponse.json({
    id: challenge.id,
    strongestCounterArguments: parsed.strongestCounterArguments,
    implicitAssumptions: parsed.implicitAssumptions,
    clarifyingQuestion: parsed.clarifyingQuestion,
  });
}
