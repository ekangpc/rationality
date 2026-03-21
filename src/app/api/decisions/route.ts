import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decisions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(decisions)
    .where(eq(decisions.userId, userId))
    .orderBy(decisions.createdAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, thesis, keyAssumptions, expectedOutcome, expectedTimeline, premortemAnswer } = body;

  if (!title || !thesis) {
    return NextResponse.json({ error: "title and thesis are required" }, { status: 400 });
  }

  // Upsert user record
  await db
    .insert(users)
    .values({ id: userId, email: body.email ?? "" })
    .onConflictDoNothing();

  const [decision] = await db
    .insert(decisions)
    .values({
      userId,
      title,
      thesis,
      keyAssumptions: keyAssumptions ? JSON.stringify(keyAssumptions) : null,
      expectedOutcome: expectedOutcome ?? null,
      expectedTimeline: expectedTimeline ?? null,
      premortemAnswer: premortemAnswer ?? null,
    })
    .returning();

  return NextResponse.json(decision, { status: 201 });
}
