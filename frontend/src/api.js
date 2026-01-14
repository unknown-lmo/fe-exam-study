const API_BASE = 'http://localhost:3001/api';

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

export async function fetchQuestions(category = null) {
  const url = category
    ? `${API_BASE}/questions?category=${category}`
    : `${API_BASE}/questions`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchRandomQuestions(category = null, count = 5) {
  const params = new URLSearchParams({ count: count.toString() });
  if (category) params.append('category', category);
  const res = await fetch(`${API_BASE}/questions/random?${params}`);
  return res.json();
}

export async function fetchWeakQuestions() {
  const res = await fetch(`${API_BASE}/questions/weak`);
  return res.json();
}

export async function submitAnswer(questionId, selectedAnswer) {
  const res = await fetch(`${API_BASE}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, selectedAnswer })
  });
  return res.json();
}

export async function fetchProgress() {
  const res = await fetch(`${API_BASE}/progress`);
  return res.json();
}

export async function fetchHistory(limit = 20) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  return res.json();
}

export async function resetProgress() {
  const res = await fetch(`${API_BASE}/progress/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchGlossary(category = null, search = null) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/glossary${query ? '?' + query : ''}`);
  return res.json();
}

export async function fetchGlossaryTerm(id) {
  const res = await fetch(`${API_BASE}/glossary/${id}`);
  return res.json();
}

export async function fetchQuestionsList(category = null, difficulty = null, search = null) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (search) params.append('search', search);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/questions/list${query ? '?' + query : ''}`);
  return res.json();
}

export async function fetchQuestionById(id) {
  const res = await fetch(`${API_BASE}/questions/${id}`);
  return res.json();
}
