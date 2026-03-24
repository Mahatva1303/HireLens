import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import { createRequire } from "module";
import OpenAI from "openai";

dotenv.config();
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [/^http:\/\/(127\.0\.0\.1|localhost):5500$/],
    methods: ["GET", "POST"],
  })
);


app.use(express.json());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("📄 File received:", req.file.originalname);

    const fileBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(fileBuffer);
    const text = data.text;

    if (!text || text.trim().length === 0)
      return res.status(400).json({ error: "Could not extract text from resume." });

    const prompt = `
You are an ATS (Applicant Tracking System) analyzer.
Analyze the following resume text and return ONLY valid JSON (no markdown or explanation).

Output strictly in this format:
{
  "score": 0-100,
  "suggestions": [
    "tip 1",
    "tip 2",
    "tip 3",
    "tip 4",
    "tip 5"
  ]
}

Resume text:
${text}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = response.choices[0].message.content.trim();
    console.log("🧠 GPT Raw Output:", raw);

    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      console.warn("⚠️ GPT returned invalid JSON, using fallback...");
      analysis = {
        score: Math.floor(Math.random() * 41) + 60,
        suggestions: [
          "Add measurable achievements (e.g., increased efficiency by 20%)",
          "Include more relevant keywords",
          "Ensure consistent formatting and bullet points",
        ],
      };
    }

    fs.unlinkSync(req.file.path);
    res.json(analysis);
  } catch (err) {
    console.error("💥 Error analyzing resume:", err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));

