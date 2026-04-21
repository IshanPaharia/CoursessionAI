// ─── Constants ───────────────────────────────────────────────────────────────

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const TIMEOUT_MS = 30_000;

// OpenRouter free models — all share ONE daily quota per account.
// If the quota is exhausted, ALL of these will 429. Gemini is the true fallback.
const OPENROUTER_MODELS = [
  'openrouter/free',                        // auto-routes to best available free model
  'nvidia/nemotron-3-super-120b-a12b:free', // 120B MoE, 1M ctx — #1 ranked
  'openai/gpt-oss-120b:free',               // OpenAI open-weight 117B MoE
  'google/gemma-4-31b-it:free',             // Google Gemma 4, 256K ctx
  'meta-llama/llama-3.3-70b-instruct:free', // Llama 3.3 70B, reliable
  'qwen/qwen3-coder:free',                  // Qwen3 Coder 480B, great for code
];

// Gemini free tier (completely separate quota from OpenRouter — no credit card needed):
//   Flash-Lite: 15 RPM, 1000 RPD  ← high volume, good quality
//   Flash:      10 RPM,  250 RPD  ← better quality
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite', // highest free quota — use first
  'gemini-2.5-flash', // mid-tier, better quality
  'gemini-2.0-flash-lite', // broader compatibility fallback
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

function isQuotaExhausted(error) {
  // OpenRouter's account-level daily free quota — affects ALL free models at once
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.status === 429
    && (message.includes('free-models-per-day') || message.includes('rate limit exceeded'))
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

// ─── OpenRouter ───────────────────────────────────────────────────────────────

async function callOpenRouterModel(payload) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw createError('OPENROUTER_API_KEY not configured');

  const res = await fetchWithTimeout(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://coursession.ai',
      'X-Title': 'CoursessionAI',
    },
    body: JSON.stringify(payload),
  });

  const body = parseBody(await res.text(), res.status);

  if (!res.ok) {
    const message = body?.error?.message || `OpenRouter error: ${res.status}`;
    throw createError(message, res.status);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content?.trim()) throw createError('OpenRouter returned empty content', 502);
  return content;
}

/**
 * Returns the response string, or null if the account-level free quota is exhausted
 * (so the caller can fall through to Gemini).
 */
async function tryOpenRouter(payload, preferredModel) {
  const models = [
    preferredModel,
    process.env.OPENROUTER_MODEL,
    ...(process.env.OPENROUTER_FALLBACK_MODELS || '').split(','),
    ...OPENROUTER_MODELS,
  ].map(m => m?.trim()).filter(Boolean);

  const uniqueModels = [...new Set(models)];
  let lastError = null;

  for (const model of uniqueModels) {
    try {
      return await callOpenRouterModel({ ...payload, model });
    } catch (error) {
      lastError = error;

      if (isQuotaExhausted(error)) {
        // Account-level daily cap hit — no point trying more models on OpenRouter
        console.warn('OpenRouter daily free quota exhausted — switching to Gemini fallback');
        return null;
      }

      if (!isRetryableError(error)) throw error;

      console.warn(`OpenRouter model failed, trying next: ${model}`, {
        status: error.status,
        message: error.message,
      });
    }
  }

  // All models tried, last error was not quota-related
  if (lastError?.status === 429) return null; // Still a rate limit — let Gemini try
  throw createError(
    'All OpenRouter models unavailable. Please try again shortly.',
    lastError?.status ?? 502
  );
}

// ─── Gemini Fallback ──────────────────────────────────────────────────────────

async function callGeminiModel(payload, model) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw createError('GEMINI_API_KEY not configured');

  // Gemini's OpenAI-compatible endpoint uses Bearer auth, matching the official REST examples.
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
    'All Gemini models unavailable. Please try again shortly.',
    lastError?.status === 429 ? 429 : 502
  );
}

// ─── Unified Entry Point ──────────────────────────────────────────────────────

/**
 * Try OpenRouter first (free tier). If its daily quota is exhausted,
 * automatically fall back to Google Gemini (separate free quota).
 */
async function post(payload, preferredModel) {
  // 1. Try OpenRouter (skip gracefully if API key not set)
  if (process.env.OPENROUTER_API_KEY) {
    const result = await tryOpenRouter(payload, preferredModel);
    if (result !== null) return result;
  }

  // 2. Fall back to Gemini
  if (!process.env.GEMINI_API_KEY) {
    throw createError(
      'OpenRouter daily free quota exhausted and GEMINI_API_KEY is not set. ' +
      'Get a free key at https://aistudio.google.com and add it to your .env as GEMINI_API_KEY.',
      429
    );
  }

  console.info('Using Gemini API fallback');
  return tryGemini(payload);
}

// ─── Public Functions ─────────────────────────────────────────────────────────

export async function callAI(prompt, { model, maxTokens = 1024 } = {}) {
  return post(
    { max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] },
    model
  );
}

// Legacy alias so existing imports of callOpenRouter still work
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
