import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [decision] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.userId, userId)));

  if (!decision) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(decision);
}
