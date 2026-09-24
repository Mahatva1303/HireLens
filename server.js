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
const uploadMemory = multer({ storage: multer.memoryStorage() });

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
      model: "openai/gpt-oss-120b"
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
      model: "openai/gpt-oss-120b"
    });

    const result = response.choices[0].message.content;

    res.json({ result });

  } catch (err) {
    console.error("❌ GROQ MATCH ERROR:", err.message);
    res.status(500).json({ error: "Match failed" });
  }
});
// job match end




// cover letter
app.post("/generate-cover-letter", async (req, res) => {
  try {
    const { text, role, company } = req.body;

    if (!text || !role || !company) {
      return res.status(400).json({ error: "Missing data" });
    }

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Write a professional cover letter for the role of ${role} at ${company} based on this resume. Keep it under 300 words, formal tone, 3 paragraphs.\n\nResume:\n${text}`
        }
      ],
      model: "openai/gpt-oss-120b"
    });

    const coverLetter = response.choices[0].message.content;
    res.json({ coverLetter });

  } catch (err) {
    console.error("Cover letter error:", err.message);
    res.status(500).json({ error: "Cover letter generation failed" });
  }
});
// cover letter end


// ── GITHUB PROFILE ANALYSIS ──────────────────────────────────
app.post("/api/analyze-github", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const profileRes = await fetch(`https://api.github.com/users/${username}`);
    if (!profileRes.ok) {
      return res.status(404).json({ error: `GitHub user "${username}" not found.` });
    }
    const profileData = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    const repos = await reposRes.json();

    const repoSummary = repos.map(r => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      updatedAt: r.updated_at
    }));

    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
    const accountAgeYears = Math.floor(
      (Date.now() - new Date(profileData.created_at)) / (1000 * 60 * 60 * 24 * 365)
    );

    const prompt = `
You are a professional career coach and technical recruiter. Analyze this GitHub profile and give honest, actionable feedback.

PROFILE DATA:
- Username: ${profileData.login}
- Name: ${profileData.name || 'Not set'}
- Bio: ${profileData.bio || 'Not set'}
- Public repos: ${profileData.public_repos}
- Followers: ${profileData.followers}
- Following: ${profileData.following}
- Account created: ${profileData.created_at}
- Location: ${profileData.location || 'Not set'}

TOP REPOS:
${JSON.stringify(repoSummary, null, 2)}

LANGUAGES USED: ${languages.join(', ') || 'None detected'}

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "overallScore": <number 0-100>,
  "scores": [
    { "label": "Code quality signals", "value": <0-100> },
    { "label": "README & documentation", "value": <0-100> },
    { "label": "Project diversity", "value": <0-100> },
    { "label": "Contribution activity", "value": <0-100> },
    { "label": "Profile completeness", "value": <0-100> }
  ],
  "insights": [
    { "type": "strength", "text": "<specific observation>" },
    { "type": "improvement", "text": "<specific actionable improvement>" },
    { "type": "redflag", "text": "<something hurting their chances>" },
    { "type": "tip", "text": "<one concrete recruiter tip>" }
  ],
  "skills": [<array of detected languages and skills as strings>]
}`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    let analysis;
    try {
      const raw = completion.choices[0].message.content.trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "AI returned unexpected response. Please try again." });
    }

    res.json({
      profile: {
        login: profileData.login,
        name: profileData.name,
        bio: profileData.bio,
        publicRepos: profileData.public_repos,
        followers: profileData.followers,
        accountAge: accountAgeYears
      },
      analysis
    });

  } catch (err) {
    console.error("GitHub analyze error:", err);
    res.status(500).json({ error: "Failed to analyze profile. Please try again." });
  }
});


// ── LINKEDIN PROFILE ANALYSIS ────────────────────────────────
app.post("/api/analyze-linkedin", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "LinkedIn username is required." });
  }

  try {
    const profileUrl = `https://www.linkedin.com/in/${username}`;

    const prompt = `
You are a professional LinkedIn profile coach and recruiter. Analyze this LinkedIn profile and give specific, honest, actionable feedback.

LinkedIn Profile URL: ${profileUrl}
Username: ${username}

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "overallScore": <number 0-100>,
  "sectionsFound": <estimated number 1-8>,
  "keywordScore": <number 0-100>,
  "scores": [
    { "label": "Headline effectiveness", "value": <0-100> },
    { "label": "About / summary section", "value": <0-100> },
    { "label": "Experience descriptions", "value": <0-100> },
    { "label": "Skills & endorsements", "value": <0-100> },
    { "label": "Profile completeness", "value": <0-100> }
  ],
  "insights": [
    { "type": "strength", "text": "<actionable strength tip>" },
    { "type": "redflag", "text": "<something commonly missing that hurts profiles>" },
    { "type": "improvement", "text": "<specific actionable improvement>" },
    { "type": "tip", "text": "<one concrete recruiter-perspective tip>" }
  ],
  "missingKeywords": [<3-5 commonly missing keywords as strings>],
  "foundKeywords": [<3-5 commonly good keywords to have as strings>]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    let analysis;
    try {
      const raw = completion.choices[0].message.content.trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "AI returned unexpected response. Please try again." });
    }

    res.json({
      profile: { name: username, headline: `linkedin.com/in/${username}` },
      analysis
    });

  } catch (err) {
    console.error("LinkedIn analyze error:", err);
    res.status(500).json({ error: "Failed to analyze profile. Please try again." });
  }
});




// =====================================================
// PATHFINDER - AI CAREER ROADMAP
// =====================================================

app.post("/api/pathfinder", async (req, res) => {

  try {

    const {
      role,
      level,
      skills,
      experience,
      hours
    } = req.body;


    // ---------------- VALIDATION ----------------

    if (!role || !level) {
      return res.status(400).json({
        error: "Target role and current level are required."
      });
    }


    // ---------------- AI PROMPT ----------------

    const prompt = `
You are PathFinder, an AI career roadmap assistant for
college students preparing for internships and placements,
especially in India.

Create a PERSONALIZED career roadmap.

==============================
STUDENT INFORMATION
==============================

Target Role:
${role}

Current Level:
${level}

Current Skills:
${skills || "No skills provided"}

Current Experience:
${experience || "Not specified"}

Available Study Time:
${hours || "Not specified"}

==============================
IMPORTANT INSTRUCTIONS
==============================

1. Do NOT give every student the same beginner roadmap.

2. Analyze the student's current level and existing skills.

3. Skip or shorten skills they already know.

4. Focus on the missing skills required for the target role.

5. Make the roadmap realistic for a college student.

6. Give a realistic estimated timeline based on the student's
   current level and available study time.

7. Suggest 5 companies relevant to this role for students
   targeting internships or placements in India.

8. Suggest useful learning resources.

9. Suggest relevant certifications.
   Mention that certifications are optional when appropriate.

10. Generate 2-3 portfolio projects that demonstrate
    skills required for the target role.

11. Generate exactly 10 resume/ATS keywords.

12. Give an entry-level salary estimate for India.
    Clearly treat this as an estimate, not a guarantee.

13. Give a brief market-demand overview.
    Do not claim exact live hiring numbers.

14. Do not guarantee employment.

15. Keep recommendations practical and achievable.

==============================
OUTPUT FORMAT
==============================

Return ONLY valid JSON.

Do not use markdown.
Do not use code blocks.
Do not write any text before or after the JSON.

Use exactly this structure:

{
  "role": "target role",
  "current_level": "student's level",
  "estimated_time": "estimated time",

  "roadmap": [
    {
      "phase": "phase name",
      "duration": "duration",
      "description": "what the student should learn",
      "skills": [
        "skill 1",
        "skill 2"
      ]
    }
  ],

  "top_companies": [
    {
      "name": "company name",
      "reason": "why this company is relevant"
    }
  ],

  "learning_resources": [
    {
      "name": "resource name",
      "type": "course / documentation / platform"
    }
  ],

  "certifications": [
    "certification 1",
    "certification 2",
    "certification 3"
  ],

  "projects": [
    {
      "title": "project title",
      "description": "project description",
      "technologies": [
        "technology 1",
        "technology 2"
      ]
    }
  ],

  "ats_keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5",
    "keyword 6",
    "keyword 7",
    "keyword 8",
    "keyword 9",
    "keyword 10"
  ],

  "salary": "entry-level Indian salary estimate",

  "market_demand": "brief market-demand overview"
}

==============================
ROADMAP REQUIREMENTS
==============================

Generate 4-7 phases.

Each phase should contain:
- what to learn
- why it matters
- relevant skills

The final phases should include:
- portfolio projects
- resume preparation
- interview preparation
- placement preparation

Personalize the roadmap according to the student's
existing skills.
`;


    // ---------------- GROQ REQUEST ----------------

    console.log("➡️ Generating PathFinder roadmap for:", role);

    const completion = await groq.chat.completions.create({

      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content:
            "You are a professional AI career roadmap generator. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.4,

      max_tokens: 4000

    });


    // ---------------- GET AI RESPONSE ----------------

    let rawResponse =
      completion.choices[0].message.content.trim();


    // Remove markdown fences if Groq adds them

    rawResponse = rawResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();


    // ---------------- PARSE JSON ----------------

    let roadmapData;

    try {

      roadmapData = JSON.parse(rawResponse);

    } catch (parseError) {

      console.error(
        "❌ PathFinder JSON Parse Error:"
      );

      console.error(rawResponse);

      return res.status(500).json({
        error:
          "AI returned an invalid roadmap. Please try again."
      });

    }


    // ---------------- SEND RESULT ----------------

    res.json(roadmapData);


  } catch (error) {

    console.error(
      "❌ PathFinder Error:",
      error.message
    );

    res.status(500).json({
      error:
        "Failed to generate career roadmap. Please try again."
    });

  }

});



// =====================================================
// JOB DESK - AI COMPANY FINDER
// =====================================================

app.post("/api/jobdesk/companies", async (req, res) => {

  try {

    const {
      role,
      university
    } = req.body;


    // ---------------- VALIDATION ----------------

    if (!role) {

      return res.status(400).json({
        error: "Job role is required."
      });

    }


    // ---------------- PROMPT ----------------

    const prompt = `
You are an AI career assistant helping college students
find companies relevant to internships and entry-level
placements in India.

The student is looking for:

TARGET ROLE:
${role}

UNIVERSITY:
${university || "Not specified"}

Generate a useful company-discovery list.

IMPORTANT:

1. Return exactly 20 companies.
2. Divide them into exactly 4 categories:
   - Top Companies: 5
   - Mid-Level Companies: 5
   - Small / Growing Companies: 5
   - Startups: 5

3. Companies must be real, established organizations.
4. Do NOT invent or hallucinate company names.
5. Prefer companies known to hire technology/business
   professionals or interns relevant to the requested role.
6. Prefer companies relevant to the Indian job market.
7. Give a short explanation of why each company is relevant.
8. Provide the official company careers URL when you know it.
9. Do not claim that a specific position is currently open
   unless you have reliable live data.
10. The careers URL should be the company's official careers
    page, NOT a job aggregator.
11. The student should be able to use the result to research
    internships and placement opportunities.
12. The LinkedIn search URL does NOT need to be generated by
    you. Our website will generate it automatically.

Return ONLY valid JSON.
No markdown.
No code fences.
No explanation outside the JSON.

Use EXACTLY this structure:

{
  "role": "requested role",

  "disclaimer": "Company suggestions are AI-generated. Students should verify current openings on the official careers page.",

  "top": [
    {
      "name": "Company Name",
      "role": "Relevant role",
      "reason": "Why this company is relevant",
      "careers_url": "https://official-careers-page"
    }
  ],

  "mid": [
    {
      "name": "Company Name",
      "role": "Relevant role",
      "reason": "Why this company is relevant",
      "careers_url": "https://official-careers-page"
    }
  ],

  "small": [
    {
      "name": "Company Name",
      "role": "Relevant role",
      "reason": "Why this company is relevant",
      "careers_url": "https://official-careers-page"
    }
  ],

  "startups": [
    {
      "name": "Company Name",
      "role": "Relevant role",
      "reason": "Why this company is relevant",
      "careers_url": "https://official-careers-page"
    }
  ]
}

Make sure each array contains EXACTLY 5 companies.

For careers_url:
- Use an official company careers page when known.
- Never use LinkedIn jobs.
- Never use Indeed.
- Never use Glassdoor.
- Never use Internshala.
- Never use a generic Google search URL.

If you are uncertain about a careers URL, use the company's
official website rather than inventing a deep careers URL.
`;


    // ---------------- GROQ REQUEST ----------------

    console.log(
      "➡️ Finding companies for role:",
      role
    );


    const completion =
      await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",

        messages: [

          {
            role: "system",

            content:
              "You are a company research assistant. Return only valid JSON."
          },

          {
            role: "user",

            content: prompt
          }

        ],

        temperature: 0.2,

        max_tokens: 5000

      });


    // ---------------- GET RESPONSE ----------------

    let rawResponse =
      completion.choices[0]
        .message
        .content
        .trim();


    // Remove markdown fences if AI adds them

    rawResponse = rawResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();


    // ---------------- PARSE JSON ----------------

    let companiesData;

    try {

      companiesData =
        JSON.parse(rawResponse);

    } catch (parseError) {

      console.error(
        "❌ Company JSON Parse Error:"
      );

      console.error(rawResponse);

      return res.status(500).json({

        error:
          "AI returned invalid company data. Please try again."

      });

    }


    // ---------------- BASIC VALIDATION ----------------

    const validStructure =
      Array.isArray(companiesData.top) &&
      Array.isArray(companiesData.mid) &&
      Array.isArray(companiesData.small) &&
      Array.isArray(companiesData.startups);


    if (!validStructure) {

      return res.status(500).json({

        error:
          "AI returned an unexpected company format."

      });

    }


    // ---------------- SEND DATA ----------------

    res.json(companiesData);


  } catch (error) {

    console.error(
      "❌ Job Desk Company Finder Error:",
      error.message
    );


    res.status(500).json({

      error:
        "Failed to find companies. Please try again."

    });

  }

});


// const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`👉 Open Login Page: http://localhost:${PORT}`);
});
