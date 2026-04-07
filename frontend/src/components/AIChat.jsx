import { useState } from "react";
import api from "../api/axios";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me anything about your CRM data." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/chat", { message: userMsg });
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="font-bold mb-3">AI Assistant (Gemini)</h3>
      <div className="h-48 overflow-y-auto space-y-2 mb-3 border rounded p-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <span className={`px-3 py-2 rounded-lg text-sm max-w-xs ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}>{m.text}</span>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm">Thinking...</p>}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your customers, leads, tasks..."
          className="flex-1 p-2 border rounded text-sm" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Send</button>
      </form>
    </div>
  );
}
