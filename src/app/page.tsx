import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Rationality</h1>
          <p className="mt-3 text-lg text-gray-600">
            A private thinking partner that challenges your investment thesis
            before you commit.
          </p>
        </div>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Get started
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to dashboard
            </Link>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </main>
  );
}
