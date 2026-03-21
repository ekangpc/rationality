"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Challenge {
  id: string;
  strongestCounterArguments: string[];
  implicitAssumptions: string[];
  clarifyingQuestion: string;
}

interface Decision {
  id: string;
  title: string;
  thesis: string;
  keyAssumptions: string | null;
  expectedOutcome: string | null;
  expectedTimeline: string | null;
  premortemAnswer: string | null;
  status: string;
  createdAt: string;
}

export default function DecisionPage() {
  const { id } = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isChallenging, setIsChallenging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/decisions/${id}`)
      .then((r) => r.json())
      .then(setDecision);
  }, [id]);

  const runChallenge = async () => {
    setIsChallenging(true);
    setError(null);
    const res = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decisionId: id }),
    });
    if (res.ok) {
      setChallenge(await res.json());
    } else {
      setError("Failed to generate challenge. Try again.");
    }
    setIsChallenging(false);
  };

  if (!decision) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const assumptions: string[] = decision.keyAssumptions
    ? JSON.parse(decision.keyAssumptions)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-black text-sm">
          ← Dashboard
        </Link>
        <h1 className="font-bold text-lg">Rationality</h1>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Decision */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-xl font-bold">{decision.title}</h2>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Thesis</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{decision.thesis}</p>
          </div>
          {assumptions.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                Key assumptions
              </p>
              <ul className="list-disc list-inside space-y-1">
                {assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-800">{a}</li>
                ))}
              </ul>
            </div>
          )}
          {decision.premortemAnswer && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                Pre-mortem
              </p>
              <p className="text-sm text-gray-800">{decision.premortemAnswer}</p>
            </div>
          )}
        </div>

        {/* Challenge section */}
        {!challenge ? (
          <div className="text-center">
            <button
              onClick={runChallenge}
              disabled={isChallenging}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isChallenging ? "Challenging your thesis..." : "Challenge this thesis"}
            </button>
            {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-lg">Devil&apos;s advocate</h3>

            <div>
              <p className="text-xs text-amber-700 uppercase font-medium mb-2">
                Strongest counterarguments
              </p>
              <ul className="space-y-3">
                {challenge.strongestCounterArguments.map((arg, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2">
                    <span className="text-amber-500 font-bold">{i + 1}.</span>
                    {arg}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs text-amber-700 uppercase font-medium mb-2">
                Assumptions you didn&apos;t state
              </p>
              <ul className="space-y-2">
                {challenge.implicitAssumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2">
                    <span className="text-amber-500">→</span> {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="text-xs text-amber-700 uppercase font-medium mb-2">
                The question you probably haven&apos;t answered
              </p>
              <p className="text-sm font-medium text-gray-900">
                {challenge.clarifyingQuestion}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
