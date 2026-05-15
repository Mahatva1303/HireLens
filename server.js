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

// app.listen(5000, () => console.log("Server running on 5000"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




// Resume Logic(first major)
// app.post("/analyze", upload.single("resume"), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const pdfData = await pdfParse(fs.readFileSync(filePath));
//     const text = pdfData.text.toLowerCase();

//     let score = 0;
//     let strengths = [];
//     let improvements = [];

//     // Sections
//     if (text.includes("skills")) { score += 10; strengths.push("Skills section present"); }
//     else improvements.push("Add skills section");

//     if (text.includes("project")) { score += 10; strengths.push("Projects included"); }
//     else improvements.push("Add projects section");

//     if (text.includes("experience")) { score += 14; strengths.push("Experience included"); }
//     else improvements.push("Add experience section");

//     if (text.includes("education")) score += 8;

//     // Keywords
//     const keywords = ["javascript","react","node","python","java","sql","html","css","api","git","docker","aws","MongoDB","C++"];
//     const matched = keywords.filter(k => text.includes(k));

//     score += matched.length * 2;

//     // Extra feature: Action verbs
//     const verbs = ["developed","built","designed","implemented"];
//     if (verbs.some(v => text.includes(v))) {
//       score += 6;
//       strengths.push("Strong action verbs used");
//     } else {
//       improvements.push("Use strong action verbs");
//     }

//     // Extra feature: Numbers/impact
//     if (/\d+%|\d+\+/.test(text)) {
//       score += 10;
//       strengths.push("Quantified achievements present");
//     } else {
//       improvements.push("Add measurable achievements");
//     }

//     if (score > 100) score = 100;

//     let rating = "Average";
//     if (score > 80) rating = "Excellent";
//     else if (score > 60) rating = "Good";
//     else if (score > 40) rating = "Needs Improvement";

//     res.json({
//       score,
//       rating,
//       strengths,
//       improvements,
//       keywords: matched,
//       text: pdfData.text 
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error");
//   }
// });



// Resume Logic (improved major update (1.1))
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const pdfData = await pdfParse(fs.readFileSync(filePath));
    fs.unlinkSync(filePath);

    const rawText = pdfData.text;
    const text = rawText.toLowerCase();

    // Word boundary check with special character escaping
    const hasWord = (word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`).test(text);
    };

    let score = 0;
    let strengths = [];
    let improvements = [];

    // ── SECTION 1: Essential Sections (max 20 pts) ──────────────
    if (hasWord("experience") || hasWord("work history")) {
      score += 6;
      strengths.push("Experience section present");
    } else {
      improvements.push("Add an Experience section");
    }

    if (hasWord("education")) {
      score += 4;
      strengths.push("Education section present");
    } else {
      improvements.push("Add an Education section");
    }

    if (hasWord("skills")) {
      score += 4;
      strengths.push("Skills section present");
    } else {
      improvements.push("Add a Skills section");
    }

    if (hasWord("projects") || hasWord("project")) {
      score += 3;
      strengths.push("Projects section present");
    } else {
      improvements.push("Add a Projects section");
    }

    const hasSummary = hasWord("summary") || hasWord("objective") || hasWord("about");
    if (hasSummary) {
      score += 3;
      strengths.push("Professional summary/objective present");
    } else {
      improvements.push("Add a professional summary or objective");
    }

    // ── SECTION 2: Contact Info (max 5 pts) ─────────────────────
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(rawText);
    const hasPhone = /(\+?\d[\d\s\-(). ]{7,}\d)/.test(rawText);

    if (hasEmail && hasPhone) {
      score += 5;
      strengths.push("Contact information is complete");
    } else {
      score += hasEmail || hasPhone ? 2 : 0;
      if (!hasEmail) improvements.push("Add a professional email address");
      if (!hasPhone) improvements.push("Add a phone number");
    }

    // ── SECTION 3: Keyword Scoring by Category (max 30 pts) ─────
  
    const keywordCategories = [
      {
        name: "Core Languages",
        weight: 3,
        words: ["javascript", "python", "java", "c++", "typescript", "go", "rust", "swift", "kotlin", "php", "ruby", "scala"]
      },
      {
        name: "DevOps & Cloud",
        weight: 3,
        words: ["docker", "aws", "git", "kubernetes", "linux", "azure", "gcp", "ci/cd", "jenkins", "terraform"]
      },
      {
        name: "Web Technologies",
        weight: 2,
        words: ["react", "node", "html", "css", "angular", "vue", "nextjs", "express", "django", "flask", "spring"]
      },
      {
        name: "Databases",
        weight: 2,
        words: ["sql", "mongodb", "postgresql", "mysql", "redis", "firebase", "sqlite", "cassandra", "oracle"]
      },
      {
        name: "Concepts",
        weight: 2,
        words: ["api", "rest", "agile", "oop", "microservices", "machine learning", "data structures", "algorithms", "graphql", "devops"]
      }
    ];

    let totalKeywordScore = 0;
    let allMatchedKeywords = [];
    let keywordBreakdown = [];

    for (const category of keywordCategories) {
      // c++ handled separately
      const matched = category.words.filter(k => {
        if (k === "c++") return text.includes("c++");
        if (k === "ci/cd") return text.includes("ci/cd");
        return hasWord(k);
      });

      allMatchedKeywords.push(...matched);

      // First 3 = full weight, beyond 3 = half weight
      const fullWeight = Math.min(matched.length, 3) * category.weight;
      const halfWeight = Math.max(matched.length - 3, 0) * (category.weight / 2);
      const catScore = Math.min(fullWeight + halfWeight, category.weight * 3);

      totalKeywordScore += catScore;
      keywordBreakdown.push(`${category.name}: ${matched.length} matched`);
    }

    // Cap total keyword score at 30
    totalKeywordScore = Math.min(Math.round(totalKeywordScore), 30);
    score += totalKeywordScore;

    if (allMatchedKeywords.length >= 8) {
      strengths.push(`Strong keyword coverage — ${allMatchedKeywords.length} skills matched`);
    } else if (allMatchedKeywords.length >= 4) {
      strengths.push(`Moderate keyword coverage — ${allMatchedKeywords.length} skills matched`);
      improvements.push("Add more technical skills relevant to your target role");
    } else {
      improvements.push("Very few technical keywords found — add relevant skills");
    }

    // ── SECTION 4: Action Verbs (max 10 pts, 2 pts each) ────────
    const verbs = [
      "developed", "built", "designed", "implemented", "led",
      "managed", "optimized", "architected", "deployed", "automated",
      "reduced", "increased", "delivered", "collaborated", "launched",
      "created", "improved", "engineered", "integrated", "mentored"
    ];

    const matchedVerbs = verbs.filter(v => hasWord(v));
    const verbScore = Math.min(matchedVerbs.length * 2, 10);
    score += verbScore;

    if (matchedVerbs.length >= 4) {
      strengths.push(`Strong action verbs used (${matchedVerbs.length} found)`);
    } else if (matchedVerbs.length >= 1) {
      score += 0;
      improvements.push("Use more action verbs: optimized, deployed, engineered, led...");
    } else {
      improvements.push("Start bullet points with strong action verbs");
    }

    // ── SECTION 5: Quantified Achievements (max 15 pts) ─────────
    const quantifiedPatterns = [
      /\d+\s*%/,
      /\d+\s*x\b/,
      /\d+\+/,
      /\$\s*\d+/,
      /\d+\s*(million|thousand|users|clients|teams?|engineers?|projects?)/i
    ];

    const quantMatches = quantifiedPatterns.filter(p => p.test(rawText)).length;

    if (quantMatches >= 3) {
      score += 15;
      strengths.push("Excellent use of quantified achievements");
    } else if (quantMatches === 2) {
      score += 10;
      strengths.push("Good quantified achievements present");
      improvements.push("Add more measurable results to strengthen impact");
    } else if (quantMatches === 1) {
      score += 5;
      improvements.push("Add more measurable impact e.g. 'improved speed by 40%', 'served 10K+ users'");
    } else {
      improvements.push("No measurable achievements found — add numbers and impact");
    }

    // ── SECTION 6: Online Presence (max 5 pts) ──────────────────
    const hasLinkedIn = /linkedin\.com\/in\//i.test(rawText);
    const hasGitHub   = /github\.com\//i.test(rawText);

    if (hasLinkedIn && hasGitHub) {
      score += 5;
      strengths.push("LinkedIn and GitHub profiles included");
    } else if (hasLinkedIn || hasGitHub) {
      score += 2;
      improvements.push(hasLinkedIn ? "Add your GitHub profile URL" : "Add your LinkedIn profile URL");
    } else {
      improvements.push("Add LinkedIn and GitHub profile links");
    }

    // ── SECTION 7: Resume Length (max 5 pts) ────────────────────
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount >= 300 && wordCount <= 900) {
      score += 5;
      strengths.push(`Resume length is ideal (${wordCount} words)`);
    } else if (wordCount >= 200 && wordCount < 300) {
      score += 2;
      improvements.push("Resume is a bit short — add more detail to experience and projects");
    } else if (wordCount > 900) {
      score += 3;
      improvements.push("Resume is too long — trim to 1 page (300–900 words)");
    } else {
      improvements.push("Resume is too short — significantly more detail needed");
    }

    // ── SECTION 8: Certifications Bonus (max 5 pts) ─────────────
    const hasCert = hasWord("certification") || hasWord("certified") || hasWord("certificate");
    if (hasCert) {
      score += 5;
      strengths.push("Certifications mentioned");
    } else {
      improvements.push("Add any relevant certifications");
    }

    // ── FINAL SCORE ──────────────────────────────────────────────
    score = Math.min(Math.round(score), 100);

    let rating = "Poor";
    if      (score >= 85) rating = "Excellent";
    else if (score >= 70) rating = "Good";
    else if (score >= 50) rating = "Needs Improvement";

    res.json({
      score,
      rating,
      strengths,
      improvements,
      keywords: allMatchedKeywords,
      keywordBreakdown,
      wordCount,
      text: rawText
    });

  } catch (err) {
    console.error("Resume analysis error:", err);
    res.status(500).json({ error: "Failed to analyze resume. Please upload a valid PDF." });
  }
});

// resume logic end




// resume summary
app.post("/generate-summary", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    console.log("➡️ Generating summary using Groq");

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
    console.error("❌ GROQ SUMMARY ERROR:", err.message);
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
    console.error("❌ GROQ MATCH ERROR:", err.message);
    res.status(500).json({ error: "Match failed" });
  }
});
// const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`👉 Open Login Page: http://localhost:${PORT}`);
});



// job match end