import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Rationality</h1>
        <Link
          href="/decisions/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + New decision
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Your decisions</h2>
        <p className="text-gray-500">
          No decisions logged yet.{" "}
          <Link href="/decisions/new" className="text-black underline">
            Log your first thesis.
          </Link>
        </p>
      </main>
    </div>
  );
}
