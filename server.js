require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
// Resume logic import
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const Groq = require("groq-sdk");
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// resume logic import end

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // IMPORTANT for your structure

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  email: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);

// POST
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json(reviews);
});

app.listen(5000, () => console.log("Server running on 5000"));


// Resume Logic
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const pdfData = await pdfParse(fs.readFileSync(filePath));
    const text = pdfData.text.toLowerCase();

    let score = 0;
    let strengths = [];
    let improvements = [];

    // Sections
    if (text.includes("skills")) { score += 15; strengths.push("Skills section present"); }
    else improvements.push("Add skills section");

    if (text.includes("project")) { score += 15; strengths.push("Projects included"); }
    else improvements.push("Add projects section");

    if (text.includes("experience")) { score += 20; strengths.push("Experience included"); }
    else improvements.push("Add experience section");

    if (text.includes("education")) score += 10;

    // Keywords
    const keywords = ["javascript","react","node","python","java","sql","html","css","api","git"];
    const matched = keywords.filter(k => text.includes(k));

    score += matched.length * 3;

    // Extra feature: Action verbs
    const verbs = ["developed","built","designed","implemented"];
    if (verbs.some(v => text.includes(v))) {
      score += 10;
      strengths.push("Strong action verbs used");
    } else {
      improvements.push("Use strong action verbs");
    }

    // Extra feature: Numbers/impact
    if (/\d+%|\d+\+/.test(text)) {
      score += 10;
      strengths.push("Quantified achievements present");
    } else {
      improvements.push("Add measurable achievements");
    }

    if (score > 100) score = 100;

    let rating = "Average";
    if (score > 80) rating = "Excellent";
    else if (score > 60) rating = "Good";
    else if (score > 40) rating = "Needs Improvement";

    res.json({
      score,
      rating,
      strengths,
      improvements,
      keywords: matched,
      text: pdfData.text 
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});


// resume summary
// app.post("/generate-summary", async (req, res) => {
//   try {
//     const { text } = req.body;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{
//         role: "user",
//         content: `Give a 2 line professional resume summary:\n${text}`
//       }]
//     });

//     res.json({ summary: response.choices[0].message.content });

//   } catch (err) {
//     res.status(500).send("Error");
//   }
// });


app.post("/generate-summary", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    console.log(" Generating summary using Groq");

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Give a professional 2-line resume summary:\n${text}`
        }
      ],
      model: "llama-3.1-8b-instant"
    });

    const summary = response.choices[0].message.content;

    res.json({ summary });

  } catch (err) {
    console.error(" GROQ SUMMARY ERROR:", err.message);
    res.status(500).json({ error: "Summary failed" });
  }
});
// resume summary end

// job match
app.post("/match-job", async (req, res) => {
  try {
    const { text, role, company } = req.body;

    if (!text || !role || !company) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("➡️ Matching resume with job");

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
Rate this resume for ${role} at ${company}.
Return ONLY one: Strong Match / Moderate Match / Weak Match.

Resume:
${text}
`
        }
      ],
      model: "llama-3.1-8b-instant"
    });

    const result = response.choices[0].message.content;

    res.json({ result });

  } catch (err) {
    console.error(" GROQ MATCH ERROR:", err.message);
    res.status(500).json({ error: "Match failed" });
  }
});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(` Server running at: http://localhost:${PORT}`);
  console.log(` Open Login Page: http://localhost:${PORT}`);
});



// job match end
