"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDecisionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    ticker: "",
    thesis: "",
    keyAssumptions: ["", "", ""],
    expectedOutcome: "",
    expectedTimeline: "",
    premortemAnswer: "",
  });

  const updateAssumption = (index: number, value: string) => {
    const updated = [...form.keyAssumptions];
    updated[index] = value;
    setForm({ ...form, keyAssumptions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const assumptions = form.keyAssumptions.filter((a) => a.trim() !== "");

    const res = await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ticker: form.ticker.trim() || null,
        keyAssumptions: assumptions,
      }),
    });

    if (res.ok) {
      const decision = await res.json();
      router.push(`/decisions/${decision.id}`);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <h1 className="font-bold text-lg">Rationality</h1>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-2">Log a decision</h2>
        <p className="text-gray-500 mb-8">
          Write your thesis before you commit. Be specific — the challenger
          works on your words.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Decision title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Long NVDA, Seed Acme Inc"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ticker / asset
              </label>
              <input
                type="text"
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value })}
                placeholder="e.g. NVDA, BTC"
                maxLength={16}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Your thesis *
            </label>
            <textarea
              required
              rows={5}
              value={form.thesis}
              onChange={(e) => setForm({ ...form, thesis: e.target.value })}
              placeholder="Why are you making this bet? Be specific about your reasoning."
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Key assumptions (what must be true for this to work?)
            </label>
            {form.keyAssumptions.map((assumption, i) => (
              <input
                key={i}
                type="text"
                value={assumption}
                onChange={(e) => updateAssumption(i, e.target.value)}
                placeholder={`Assumption ${i + 1}`}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black mb-2"
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Expected outcome
              </label>
              <input
                type="text"
                value={form.expectedOutcome}
                onChange={(e) =>
                  setForm({ ...form, expectedOutcome: e.target.value })
                }
                placeholder="e.g. 3x return"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Timeline
              </label>
              <input
                type="text"
                value={form.expectedTimeline}
                onChange={(e) =>
                  setForm({ ...form, expectedTimeline: e.target.value })
                }
                placeholder="e.g. 18 months"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Pre-mortem: if this fails in 12 months, what&apos;s the most
              likely reason?
            </label>
            <textarea
              rows={3}
              value={form.premortemAnswer}
              onChange={(e) =>
                setForm({ ...form, premortemAnswer: e.target.value })
              }
              placeholder="Force yourself to think about this before committing."
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Log decision & challenge thesis →"}
          </button>
        </form>
      </main>
    </div>
  );
}
