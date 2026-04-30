import { useState } from "react";
import api from "../api/axios";

const EMAIL_TYPES = [
  { value: "follow_up", label: "Follow-up" },
  { value: "proposal", label: "Sales Proposal" },
  { value: "welcome", label: "Welcome Email" },
  { value: "re_engage", label: "Re-engagement" },
  { value: "complaint_response", label: "Complaint Response" },
];

export default function EmailComposer() {
  const [form, setForm] = useState({ type: "follow_up", recipientName: "", recipientEmail: "", context: "" });
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!form.recipientName) return;
    setLoading(true);
    try {
      const { data } = await api.post("/email/draft-email", form);
      setDraft(data.draft);
    } catch { setDraft("Failed to generate. Check your Gemini API key."); }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoLink = () => {
    const subject = encodeURIComponent(`Message for ${form.recipientName}`);
    const body = encodeURIComponent(draft);
    return `mailto:${form.recipientEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">AI Email Composer</h2>
      <p className="text-sm text-gray-500">Generate professional emails using AI — then copy or send directly.</p>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded">
              {EMAIL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Name</label>
            <input value={form.recipientName} onChange={e => setForm({ ...form, recipientName: e.target.value })}
              placeholder="John Smith" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Email (optional)</label>
            <input type="email" value={form.recipientEmail} onChange={e => setForm({ ...form, recipientEmail: e.target.value })}
              placeholder="john@company.com" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Context / Key Points</label>
            <input value={form.context} onChange={e => setForm({ ...form, context: e.target.value })}
              placeholder="e.g. discussed pricing last week, interested in Pro plan" className="w-full p-2 border rounded" />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !form.recipientName}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50">
          {loading ? "✨ Generating..." : "✨ Generate Email with AI"}
        </button>
      </div>

      {draft && (
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Generated Draft</h3>
            <div className="flex gap-2">
              <button onClick={copy} className={`px-3 py-1 rounded text-sm ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
              {form.recipientEmail && (
                <a href={mailtoLink()} className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700">
                  📧 Open in Mail
                </a>
              )}
            </div>
          </div>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={14}
            className="w-full p-3 border rounded text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <button onClick={generate} disabled={loading} className="text-sm text-blue-600 hover:underline">
            🔄 Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
