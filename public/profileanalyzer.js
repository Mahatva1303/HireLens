// ── TAB SWITCHING ──────────────────────────────────────────────
function setTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-view').forEach(v => {
    v.classList.remove('active-view');
    v.style.display = 'none';
  });

  const viewMap = { overview: 'tab-overview', github: 'tab-github', linkedin: 'tab-linkedin' };
  document.getElementById(viewMap[tab]).classList.add('active');
  const view = document.getElementById('view-' + tab);
  view.style.display = 'block';
  view.classList.add('active-view');
}

// ── GITHUB ANALYSIS ────────────────────────────────────────────
async function analyzeGithub() {
  const username = document.getElementById('github-username').value.trim();
  if (!username) {
    showError('github-error', 'Please enter a GitHub username.');
    return;
  }

  setGithubLoading(true);
  hideElement('github-error');
  hideElement('github-results');

  try {
    const res = await fetch('/api/analyze-github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (!res.ok) {
      showError('github-error', data.error || 'Something went wrong. Please try again.');
      return;
    }

    renderGithubResults(data);
    showElement('github-results');
  } catch (err) {
    showError('github-error', 'Network error. Make sure the server is running.');
  } finally {
    setGithubLoading(false);
  }
}

function setGithubLoading(on) {
  document.getElementById('github-loading').style.display = on ? 'block' : 'none';
  document.getElementById('github-analyze-btn').disabled = on;
  document.getElementById('github-analyze-btn').textContent = on ? 'Analyzing...' : 'Analyze';
}

function renderGithubResults(data) {
  const { profile, analysis } = data;

  // Metrics
  document.getElementById('github-metrics').innerHTML = `
    <div class="metric-card">
      <div class="metric-label">Overall score</div>
      <div class="metric-value" style="color:${scoreColor(analysis.overallScore)}">${analysis.overallScore}<span>/100</span></div>
      <div class="metric-sub">${scoreLabel(analysis.overallScore)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Public repos</div>
      <div class="metric-value">${profile.publicRepos}</div>
      <div class="metric-sub">${profile.followers} followers</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Account age</div>
      <div class="metric-value">${profile.accountAge}</div>
      <div class="metric-sub">years on GitHub</div>
    </div>
  `;

  // Result card
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile.login.slice(0, 2).toUpperCase();

  document.getElementById('github-result-card').innerHTML = `
    <div class="result-profile-row">
      <div class="profile-avatar">${initials}</div>
      <div>
        <div class="profile-name">${profile.name || profile.login}</div>
        <div class="profile-meta">${profile.bio || 'GitHub Developer'} · ${profile.followers} followers</div>
      </div>
    </div>
    <hr class="divider">

    <div class="score-section">
      ${renderScoreBars(analysis.scores)}
    </div>
    <hr class="divider">

    <div class="insights-section">
      ${renderInsights(analysis.insights)}
    </div>
    <hr class="divider">

    <div class="tags-section">
      <div class="tags-label">Detected skills & languages</div>
      <div class="tags-row">
        ${(analysis.skills || []).map(s => `<span class="tag tag-found">${s}</span>`).join('')}
      </div>
    </div>

    <div class="actions-row">
      <button class="action-btn" onclick="copyReport('github')">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy Report
      </button>
      <button class="action-btn" onclick="window.open('https://github.com/${profile.login}', '_blank')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        View Profile
      </button>
    </div>
  `;

  window._githubReport = data;
}

// ── LINKEDIN ANALYSIS ──────────────────────────────────────────
let selectedLinkedinFile = null;

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  selectedLinkedinFile = file;

  document.getElementById('file-selected').style.display = 'flex';
  document.getElementById('file-selected').innerHTML = `
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    ${file.name}
  `;
  showElement('linkedin-analyze-btn');
}

async function analyzeLinkedin() {
  if (!selectedLinkedinFile) {
    showError('linkedin-error', 'Please select your LinkedIn PDF first.');
    return;
  }

  setLinkedinLoading(true);
  hideElement('linkedin-error');
  hideElement('linkedin-results');

  try {
    const formData = new FormData();
    formData.append('pdf', selectedLinkedinFile);

    const res = await fetch('/api/analyze-linkedin', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      showError('linkedin-error', data.error || 'Something went wrong. Please try again.');
      return;
    }

    renderLinkedinResults(data);
    showElement('linkedin-results');
  } catch (err) {
    showError('linkedin-error', 'Network error. Make sure the server is running.');
  } finally {
    setLinkedinLoading(false);
  }
}

function setLinkedinLoading(on) {
  document.getElementById('linkedin-loading').style.display = on ? 'block' : 'none';
  document.getElementById('linkedin-analyze-btn').disabled = on;
  document.getElementById('linkedin-analyze-btn').textContent = on ? 'Analyzing...' : 'Analyze Profile';
}

function renderLinkedinResults(data) {
  const { profile, analysis } = data;

  document.getElementById('linkedin-metrics').innerHTML = `
    <div class="metric-card">
      <div class="metric-label">Profile strength</div>
      <div class="metric-value" style="color:${scoreColor(analysis.overallScore)}">${analysis.overallScore}<span>/100</span></div>
      <div class="metric-sub">${scoreLabel(analysis.overallScore)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Sections found</div>
      <div class="metric-value">${analysis.sectionsFound}</div>
      <div class="metric-sub">of 8 key sections</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Keyword match</div>
      <div class="metric-value">${analysis.keywordScore}<span>%</span></div>
      <div class="metric-sub">vs job market</div>
    </div>
  `;

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'LI';

  document.getElementById('linkedin-result-card').innerHTML = `
    <div class="result-profile-row">
      <div class="profile-avatar" style="background:#dbeafe;color:#0a66c2">${initials}</div>
      <div>
        <div class="profile-name">${profile.name || 'LinkedIn User'}</div>
        <div class="profile-meta">${profile.headline || 'Professional'}</div>
      </div>
    </div>
    <hr class="divider">

    <div class="score-section">
      ${renderScoreBars(analysis.scores)}
    </div>
    <hr class="divider">

    <div class="insights-section">
      ${renderInsights(analysis.insights)}
    </div>
    <hr class="divider">

    <div class="tags-section">
      <div class="tags-label">Missing keywords (add these to your profile)</div>
      <div class="tags-row">
        ${(analysis.missingKeywords || []).map(k => `<span class="tag tag-missing">${k}</span>`).join('')}
        ${(analysis.foundKeywords || []).map(k => `<span class="tag tag-found">${k}</span>`).join('')}
      </div>
    </div>

    <div class="actions-row">
      <button class="action-btn" onclick="copyReport('linkedin')">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy Report
      </button>
      <button class="action-btn" onclick="window.open('https://linkedin.com', '_blank')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        Open LinkedIn
      </button>
    </div>
  `;

  window._linkedinReport = data;
}

// ── SHARED RENDER HELPERS ──────────────────────────────────────
function renderScoreBars(scores) {
  if (!scores || !scores.length) return '';
  return scores.map(s => `
    <div class="score-row">
      <div class="score-label-row">
        <span>${s.label}</span>
        <span class="score-pct" style="color:${barColor(s.value)}">${s.value}%</span>
      </div>
      <div class="score-bar-bg">
        <div class="score-bar-fill" style="width:${s.value}%; background:${barColor(s.value)}"></div>
      </div>
    </div>
  `).join('');
}

function renderInsights(insights) {
  if (!insights || !insights.length) return '';
  const iconMap = {
    strength: `<div class="insight-icon icon-success"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>`,
    improvement: `<div class="insight-icon icon-warning"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div>`,
    redflag: `<div class="insight-icon icon-danger"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>`,
    tip: `<div class="insight-icon icon-info"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>`
  };
  const labelMap = { strength: 'Strength', improvement: 'Improvement', redflag: 'Red flag', tip: 'Tip' };

  return insights.map(i => `
    <div class="insight-item">
      ${iconMap[i.type] || iconMap.tip}
      <div>
        <div class="insight-type">${labelMap[i.type] || i.type}</div>
        <div class="insight-text">${i.text}</div>
      </div>
    </div>
  `).join('');
}

// ── UTILITY ────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 75) return '#16a34a';
  if (s >= 50) return '#d97706';
  return '#dc2626';
}

function scoreLabel(s) {
  if (s >= 80) return 'Excellent';
  if (s >= 65) return 'Good standing';
  if (s >= 50) return 'Needs work';
  return 'Needs attention';
}

function barColor(v) {
  if (v >= 70) return '#16a34a';
  if (v >= 45) return '#d97706';
  return '#dc2626';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

function showElement(id) { document.getElementById(id).style.display = 'block'; }
function hideElement(id) { document.getElementById(id).style.display = 'none'; }

function copyReport(type) {
  const data = type === 'github' ? window._githubReport : window._linkedinReport;
  if (!data) return;
  const text = JSON.stringify(data.analysis, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    alert('Report copied to clipboard!');
  });
}

// Enter key triggers analysis
document.addEventListener('DOMContentLoaded', () => {
  const ghInput = document.getElementById('github-username');
  if (ghInput) {
    ghInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') analyzeGithub();
    });
  }
});