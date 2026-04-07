import { useState, useRef } from "react";
import api from "../api/axios";

export default function AIChat({ onActionDone }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I can answer questions AND perform actions. Try: \"Add a task to call John tomorrow\" or \"Create a lead for Jane at Acme\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const send = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/chat", { message: userMsg });
      setMessages((prev) => [...prev, { role: "ai", text: data.reply, action: data.action }]);
      if (data.action && data.action !== "none" && onActionDone) onActionDone(data.action);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => { e.preventDefault(); send(); };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported in this browser. Use Chrome.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="font-bold mb-1">AI Assistant (Gemini)</h3>
      <p className="text-xs text-gray-400 mb-3">Can answer questions and perform CRM actions automatically</p>
      <div className="h-56 overflow-y-auto space-y-2 mb-3 border rounded p-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <span className={`px-3 py-2 rounded-lg text-sm max-w-sm whitespace-pre-wrap ${
              m.role === "user" ? "bg-blue-600 text-white" :
              m.action && m.action !== "none" ? "bg-green-100 text-green-800 border border-green-300" :
              "bg-gray-200 text-gray-800"
            }`}>{m.text}</span>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm animate-pulse">Thinking...</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder='Try: "Add task: Follow up with John" or "Create lead for Jane"'
          className="flex-1 p-2 border rounded text-sm" />
        <button type="button" onClick={startVoice}
          className={`px-3 py-2 rounded text-sm ${listening ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 text-gray-700"}`}>
          🎤
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Send</button>
      </form>
    </div>
  );
}
