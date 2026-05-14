# HireLens-AI-Powered Resume Analyzer & Job Matching Platform 
HireLens is an intelligent web application designed to help users improve their resumes and analyze job compatibility using AI-powered insights and a custom-built ATS (Applicant Tracking System).

Users can upload their resumes in PDF format, receive ATS scores, strengths, improvement suggestions, AI-generated summaries, and job matching analysis based on company and role requirements.

![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Groq](https://img.shields.io/badge/Groq_API-F55036?style=for-the-badge&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

</div>

![Profile Page](images/profile.gif)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Pages](#pages)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---


## ✨ Features

-  **ATS Resume Scoring** — Our own built-in ATS engine analyzes your resume and gives an ATS score
-  **Strengths & Improvements** — Get detailed feedback on what's working and what to fix
-  **AI Summary** — Groq API generates a professional summary of your resume on demand
-  **Keyword Matching** — Matches the keyword from resume and display them 
-  **Job Matching** — Enter a company and job role to get a match result (e.g. Strong Match) with a summary
-  **Authentication** — Secure login and signup via Firebase Authentication
-  **User Profile** — Personal profile page for every user
-  **Review Us** — Users can leave feedback and reviews

---

## 📸 Screenshot
<p align="center">
  <img src="images/Screenshot 2026-05-14 101118.png" width="750">
  <br>
  <em> Home Page</em>
</p>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Authentication** | Firebase Authentication |
| **Database** | MongoDB |
| **AI API** | Groq API |
| **Resume Parsing** | PDF Processing |
| **Deployment** | Render |

---

## 📄 Pages

| Page | Description |
|---|---|
| **Home** | Landing page introducing HireLens |
| **Login** | Firebase-powered user authentication |
| **Profile** | View and manage your account |
| **Resume Checker** | Upload resume PDF, get ATS score, strengths & improvements |
| **Review Us** | Leave a review or read what others say (Database-MongoDB) |

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ENTRY                           │
│                    Login / Sign Up                          │
│                  (Firebase Authentication)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       HOME PAGE                             │
│              Introduction to HireLens                       │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐
│   PROFILE    │  │ RESUME CHECKER│  │      REVIEW US       │
│              │  │               │  │                      │
│ • Avatar     │  │ Upload PDF    │  │ • Write a Review     │
│   Selector   │  │     │         │  │ • Give Star Rating   │
│ • Name       │  │     ▼         │  │ • View All Reviews   │
│ • Email      │  │ ATS Engine    │  │                      │
│              │  │ Scores Resume │  │  (MongoDB Database)  │
└──────────────┘  │     │         │  └──────────────────────┘
                  │     ▼         │
                  └───────────────┘
                     ┌──────────────────────────────┐
                     │         RESULTS              │
                     ├──────────┬─────────┬─────────┤
                     │ATS Score │Strengths│ Keyword │
                     │          │  &      │ Matches │
                     │          │Improve- │         │
                     │          │ments    │         │
                     └──────────┴────┬────┴─────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                     ┌─────────────┐   ┌─────────────────────┐
                     │ AI SUMMARY  │   │    JOB MATCHING     │
                     │             │   │                     │
                     │  Groq API   │   │ Enter Company +     │
                     │  generates  │   │ Job Role            │
                     │professional │   │      │              │
                     │  summary    │   │      ▼              │
                     └─────────────┘   │  Strong Match       │
                                       │   Partial Match     │
                                       │  Weak Match         │
                                       ┴─────────────────────┘
                  
```

### Resume Checker — Step by Step

1. User uploads their resume in **PDF format**
2. The custom ATS engine parses and scores the resume
3. Results display:
   -  ATS Score
   -  Strengths & Areas of Improvement
   -  Matched Keywords
4. Click **AI Summary** → Groq API generates a professional resume summary
5. Click **Job Matching** → Enter company name & job role → Get *Strong / Partial / Weak Match* with a detailed breakdown

---

##  Project Goal

HireLens aims to bridge the gap between **job seekers and ATS systems** by providing:
- Clear insights into resume quality  
- Actionable AI-driven improvements  
- Higher chances of shortlisting  

---


## 🚀 Getting Started

````bash
# Clone the repository
git clone https://github.com/your-username/hirelens.git

# Navigate into the project
cd hirelens

# Install dependencies
npm install

# Start the server
npm start
````

---

##  Environment Variables

Create a `.env` file in the root directory and add the following:

````env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=your_mongodb_connection_string
FIREBASE_API_KEY=your_firebase_api_key
````

### 👨‍💻 Developed By
- Mahatva Agarwal
- HireLens Project – AI Resume Analyzer & Job Matcher
