"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Challenge {
  id: string;
  risks: string[];
  counterevidence: string[];
  missingAnalysis: string[];
  hardQuestion: string;
}

interface Decision {
  id: string;
  title: string;
  ticker: string | null;
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
  const [challengeError, setChallengeError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/decisions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setDecision(d);
        // Auto-run the challenge immediately on load
        runChallenge(d.id);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runChallenge = async (decisionId: string) => {
    setIsChallenging(true);
    setChallengeError(null);
    const res = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decisionId }),
    });
    if (res.ok) {
      setChallenge(await res.json());
    } else {
      setChallengeError("Failed to generate challenge. Try again.");
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
          <div className="flex items-start gap-3">
            <h2 className="text-xl font-bold flex-1">{decision.title}</h2>
            {decision.ticker && (
              <span className="bg-gray-100 text-gray-700 text-xs font-mono font-bold px-2 py-1 rounded">
                {decision.ticker}
              </span>
            )}
          </div>
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
        {isChallenging && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Challenging your thesis...
            </div>
          </div>
        )}

        {!isChallenging && challengeError && (
          <div className="text-center">
            <p className="text-red-500 text-sm mb-3">{challengeError}</p>
            <button
              onClick={() => runChallenge(decision.id)}
              className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {challenge && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Devil&apos;s advocate</h3>

            {/* Risks */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
              <p className="text-xs text-red-700 uppercase font-semibold tracking-wide">
                Risks you&apos;re carrying
              </p>
              <ul className="space-y-3">
                {challenge.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2">
                    <span className="text-red-400 font-bold mt-0.5">▲</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Counterevidence */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-3">
              <p className="text-xs text-orange-700 uppercase font-semibold tracking-wide">
                Evidence against your thesis
              </p>
              <ul className="space-y-3">
                {challenge.counterevidence.map((item, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2">
                    <span className="text-orange-400 font-bold mt-0.5">↯</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing analysis */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <p className="text-xs text-amber-700 uppercase font-semibold tracking-wide">
                What you didn&apos;t analyze
              </p>
              <ul className="space-y-3">
                {challenge.missingAnalysis.map((item, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">?</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hard question */}
            <div className="bg-white border-2 border-gray-900 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">
                The question you haven&apos;t answered
              </p>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                {challenge.hardQuestion}
              </p>
            </div>

            <button
              onClick={() => runChallenge(decision.id)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Re-run challenge →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
