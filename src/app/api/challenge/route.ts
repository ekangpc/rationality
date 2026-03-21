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

  const assetContext = decision.ticker
    ? `Asset/ticker: ${decision.ticker}`
    : "";

  const prompt = `You are a rigorous devil's advocate for investment decisions. Your job is to systematically challenge the thesis below. Be specific, ruthless, and grounded — no generic warnings.

INVESTMENT THESIS:
Title: ${decision.title}
${assetContext}
Thesis: ${decision.thesis}
${assumptions.length > 0 ? `Stated assumptions:\n${assumptions.map((a, i) => `${i + 1}. ${a}`).join("\n")}` : ""}
${decision.expectedOutcome ? `Expected outcome: ${decision.expectedOutcome}` : ""}
${decision.expectedTimeline ? `Timeline: ${decision.expectedTimeline}` : ""}
${decision.premortemAnswer ? `If this fails, investor believes: ${decision.premortemAnswer}` : ""}

Respond ONLY with this JSON (no markdown, no preamble):
{
  "risks": [
    "A specific risk the investor's thesis creates or ignores — name it precisely, not generically",
    "Another specific risk with concrete mechanism",
    "A third risk"
  ],
  "counterevidence": [
    "A specific fact, data point, or historical precedent that directly contradicts the thesis",
    "Another piece of counterevidence — be concrete, cite the mechanism"
  ],
  "missingAnalysis": [
    "A crucial factor the investor did not analyze that materially affects the thesis",
    "Another gap in their analysis"
  ],
  "hardQuestion": "One specific question that, if the investor cannot answer it well, should make them reconsider this bet entirely"
}

Rules:
- Every item MUST reference the investor's specific claims, not generic investment principles
- "Competition is a risk" is failure. Name the specific competitor or dynamic their thesis implies.
- Counterevidence must be concrete (e.g., a specific market dynamic, valuation multiple, precedent)
- Missing analysis should reveal a blind spot, not repeat what they said
- The hard question must be uncomfortable and specific to this thesis
- Be collegial but merciless`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
  }

  let parsed: {
    risks: string[];
    counterevidence: string[];
    missingAnalysis: string[];
    hardQuestion: string;
  };

  try {
    const raw = content.text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const [challenge] = await db
    .insert(thesisChallenges)
    .values({
      decisionId,
      risks: JSON.stringify(parsed.risks),
      counterevidence: JSON.stringify(parsed.counterevidence),
      missingAnalysis: JSON.stringify(parsed.missingAnalysis),
      hardQuestion: parsed.hardQuestion,
    })
    .returning();

  return NextResponse.json({
    id: challenge.id,
    risks: parsed.risks,
    counterevidence: parsed.counterevidence,
    missingAnalysis: parsed.missingAnalysis,
    hardQuestion: parsed.hardQuestion,
  });
}
