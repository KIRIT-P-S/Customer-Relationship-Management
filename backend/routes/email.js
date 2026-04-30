const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/draft-email", auth, async (req, res) => {
  try {
    const { type, recipientName, context } = req.body;
    // type: follow_up | proposal | welcome | re_engage | complaint_response

    const templates = {
      follow_up: `Write a professional follow-up email to ${recipientName}. Context: ${context || "checking in after initial contact"}`,
      proposal: `Write a compelling sales proposal email to ${recipientName}. Context: ${context || "presenting our CRM solution"}`,
      welcome: `Write a warm welcome email to new customer ${recipientName}. Context: ${context || "onboarding"}`,
      re_engage: `Write a re-engagement email to inactive customer ${recipientName}. Context: ${context || "they haven't been active recently"}`,
      complaint_response: `Write a professional, empathetic response email to ${recipientName} regarding their complaint. Context: ${context || "addressing their concern"}`,
    };

    const prompt = `${templates[type] || templates.follow_up}. 
    Write only the email body (no subject line needed separately, include Subject: at top). 
    Keep it professional, concise, and personalized. Sign off as "The CRM Team".`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ draft: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/summarize", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Summarize this CRM note/complaint in 1-2 sentences: "${text}"`);
    res.json({ summary: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
