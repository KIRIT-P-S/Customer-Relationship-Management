import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function CustomerPortal() {
  const [complaints, setComplaints] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const recognitionRef = useRef(null);

  const load = () => api.get("/complaints").then(({ data }) => setComplaints(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (complaintText) => {
    const t = (complaintText || text).trim();
    if (!t) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/complaints", { text: t });
      setResult(data);
      setText("");
      load();
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Failed to submit" });
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported. Use Chrome.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      submit(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const sentimentColor = (s) => ({
    positive: "text-green-600", negative: "text-red-600", urgent: "text-red-700 font-bold", neutral: "text-gray-500"
  }[s] || "text-gray-500");

  const statusColor = (s) => ({
    Open: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700"
  }[s] || "");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">My Support Portal</h2>

      {/* Submit Complaint */}
      <div className="bg-white shadow rounded p-5">
        <h3 className="font-bold mb-3">Submit a Complaint or Request</h3>
        <p className="text-sm text-gray-500 mb-3">Speak or type your issue — our AI will analyse it and assign the right agent automatically.</p>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          placeholder="Describe your issue..."
          className="w-full p-3 border rounded text-sm mb-3 resize-none" />

        <div className="flex gap-3">
          <button onClick={() => submit()} disabled={loading || !text.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50">
            {loading ? "Analysing..." : "Submit"}
          </button>
          <button onClick={startVoice} disabled={loading}
            className={`px-5 py-2 rounded flex items-center gap-2 ${listening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-700"}`}>
            🎤 {listening ? "Listening..." : "Speak"}
          </button>
        </div>

        {/* AI Result */}
        {result && !result.error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="font-semibold text-green-700 mb-1">✅ Complaint submitted!</p>
            <p className="text-sm"><span className="font-medium">Category:</span> {result.category}</p>
            <p className="text-sm"><span className="font-medium">Sentiment:</span> <span className={sentimentColor(result.sentiment)}>{result.sentiment}</span></p>
            <p className="text-sm"><span className="font-medium">Summary:</span> {result.aiSummary}</p>
            <p className="text-sm"><span className="font-medium">Assigned to:</span> {result.assignedTo ? result.assignedTo.name : "Pending assignment"}</p>
          </div>
        )}
        {result?.error && <p className="mt-3 text-red-500 text-sm">{result.error}</p>}
      </div>

      {/* My Complaints */}
      <div className="bg-white shadow rounded p-5">
        <h3 className="font-bold mb-3">My Complaints</h3>
        {complaints.length === 0 ? (
          <p className="text-gray-400 text-sm">No complaints submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c._id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{c.text}</p>
                  <span className={`text-xs px-2 py-1 rounded ml-2 ${statusColor(c.status)}`}>{c.status}</span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span>Category: {c.category}</span>
                  <span className={sentimentColor(c.sentiment)}>Sentiment: {c.sentiment}</span>
                  <span>Agent: {c.assignedTo?.name || "Unassigned"}</span>
                </div>
                {c.aiSummary && <p className="text-xs text-gray-400 mt-1 italic">{c.aiSummary}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
