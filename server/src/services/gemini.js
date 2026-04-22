// ─── Constants ───────────────────────────────────────────────────────────────

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const TIMEOUT_MS = 30_000;

// Gemini models (free tier):
//   Flash-Lite: 15 RPM, 1000 RPD  ← high volume, good quality
//   Flash:      10 RPM,  250 RPD  ← better quality
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite', // reliable free tier
  'gemini-1.5-flash',      // standard flash
  'gemini-1.5-flash-8b',   // lightweight
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createError(message, status) {
  const error = new Error(message);
  if (status) error.status = status;
  return error;
}

function isRetryableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.status === 404
    || error?.status === 429
    || error?.status >= 500
    || message.includes('no endpoints found')
    || message.includes('model not found')
    || message.includes('not available')
  );
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw createError('Request timed out', 504);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function parseBody(rawBody, status) {
  if (!rawBody) throw createError('Empty response body', 502);
  try {
    return JSON.parse(rawBody);
  } catch {
    if (status >= 200 && status < 300) throw createError('Invalid JSON in response', 502);
    return null;
  }
}

function extractJSON(response, description) {
  const cleaned = response.replace(/```(?:json)?/gi, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`AI did not return valid JSON for: ${description}`);
  return JSON.parse(match[0]);
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function callGeminiModel(payload, model) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw createError('GEMINI_API_KEY not configured');

  const res = await fetchWithTimeout(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, model }),
  });

  const rawText = await res.text();
  const body = parseBody(rawText, res.status);

  if (!res.ok) {
    const message = body?.error?.message
      || body?.message
      || rawText?.slice(0, 200)
      || `Gemini error: ${res.status}`;
    throw createError(message, res.status);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content?.trim()) throw createError('Gemini returned empty content', 502);
  return content;
}

async function tryGemini(payload) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      return await callGeminiModel(payload, model);
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) throw error;
      console.warn(`Gemini model failed, trying next: ${model}`, {
        status: error.status,
        message: error.message,
      });
    }
  }

  throw createError(
    'All AI models unavailable. Please try again later.',
    lastError?.status === 429 ? 429 : 502
  );
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

async function post(payload) {
  if (!process.env.GEMINI_API_KEY) {
    throw createError('GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com', 500);
  }
  return tryGemini(payload);
}

// ─── Public Functions ─────────────────────────────────────────────────────────

export async function callAI(prompt, { maxTokens = 1024 } = {}) {
  return post({ 
    max_tokens: maxTokens, 
    messages: [{ role: 'user', content: prompt }] 
  });
}

// Keep legacy export for now to avoid breaking imports immediately
export { callAI as callOpenRouter };

export async function generateCourseDescription(courseTitle, videoTitles) {
  const prompt = `You are an educational content organizer. Given this course and its video titles, write a concise, engaging course description (2-3 sentences).

Course: "${courseTitle}"

Videos:
${videoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Write ONLY the description, no title or extra formatting.`;

  return callAI(prompt);
}

export async function generateChapterSuggestions(videoTitles) {
  const prompt = `You are an educational content organizer. Given these video titles from a course, suggest logical chapter groupings.

Videos:
${videoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return a JSON array of chapters, each with "title" (chapter name) and "videoIndices" (array of 1-based video indices).
Group related videos together logically. Return ONLY valid JSON, no markdown or explanation.

Example format: [{"title": "Introduction", "videoIndices": [1, 2, 3]}, {"title": "Advanced Topics", "videoIndices": [4, 5, 6]}]`;

  const response = await callAI(prompt);
  return extractJSON(response, 'chapter suggestions');
}

export async function generateQuizQuestions(videoTitle, videoDescription) {
  const prompt = `You are an educational quiz generator specialized in creating questions that are HIGHLY SPECIFIC to the exact content of a particular video lesson. Do NOT ask generic or surface-level questions.

Video Title: "${videoTitle}"
Description: "${videoDescription || 'No description available'}"

Generate 5 multiple-choice quiz questions that:
1. Test SPECIFIC concepts, techniques, or facts that would be covered in THIS particular video
2. Include concrete details (specific terms, methods, code patterns, formulas, etc.) relevant to the video topic
3. Have plausible wrong answers that test real understanding, not just recall
4. Cover different aspects/subtopics within the video
5. Are challenging enough to verify the student actually watched and understood the content

Return ONLY a valid JSON array of 5 questions. Each question must have:
- "question": the question text (specific and detailed)
- "options": array of exactly 4 answer choices (all plausible)
- "correctAnswer": index (0-3) of the correct option

Example: [{"question": "What is...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]`;

  const response = await callAI(prompt, { maxTokens: 2048 });
  return extractJSON(response, 'quiz questions');
}

export async function generateVideoOrder(videoTitles) {
  const prompt = `You are an educational content organizer. Given these video titles from a YouTube playlist, determine the correct logical/sequential order they should be watched in.

YouTube playlists are sometimes scrambled or sorted backwards. Analyze the titles to determine the proper learning sequence based on:
- Numbered episodes/parts (Part 1 before Part 2, etc.)
- Topic progression (basics/intro before advanced)
- Prerequisites (foundational concepts before dependent ones)
- Any sequential indicators in titles

Videos (current order):
${videoTitles.map((t, i) => `${i}: ${t}`).join('\n')}

Return ONLY a valid JSON array of the original indices in the correct order.
Example: if videos are in reverse order, return [4, 3, 2, 1, 0].
If already correct, return [0, 1, 2, 3, 4].
Return ONLY the JSON array, nothing else.`;

  const response = await callAI(prompt, { maxTokens: 512 });
  return extractJSON(response, 'video order');
}

export async function generateVideoSummary(videoTitle, videoDescription) {
  const prompt = `You are an educational content summarizer. Given this video's title and description, write a concise 3-4 sentence summary of what this video likely covers. Focus on key topics and learning outcomes.

Video Title: "${videoTitle}"
Description: "${videoDescription || 'No description available'}"

Write ONLY the summary, no title or extra formatting.`;

  return callAI(prompt);
}

export async function chatWithContext(messages, videoTitle, videoDescription) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful AI tutor assisting a student who is watching a video lesson. Answer their questions clearly and concisely. Use the video context to provide relevant answers.

Video Title: "${videoTitle}"
Video Description: "${videoDescription || 'No description available'}"

Provide clear, educational responses. If the question is unrelated to the video topic, still try to help but note it's outside the video scope.`,
  };

  return post({ max_tokens: 1024, messages: [systemMessage, ...messages] });
}
