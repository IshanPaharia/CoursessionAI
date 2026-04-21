const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TIMEOUT_MS = 30_000;

function createError(message, status) {
  const error = new Error(message);
  if (status) error.status = status;
  return error;
}

async function postOpenRouter(payload) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw createError('OPENROUTER_API_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://coursession.ai',
        'X-Title': 'CoursessionAI',
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await res.text();
    let body = null;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (error) {
        if (res.ok) throw error;
      }
    }

    if (!res.ok) {
      const message = body?.error?.message || `OpenRouter API error: ${res.status}`;
      throw createError(message, res.status === 429 ? 429 : res.status);
    }

    if (!body) {
      throw createError('OpenRouter returned an empty response body', 502);
    }

    const content = body.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      throw createError('OpenRouter returned an empty response', 502);
    }

    return content;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createError('OpenRouter request timed out', 504);
    }

    if (error instanceof SyntaxError) {
      throw createError('OpenRouter returned invalid JSON', 502);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callOpenRouter(prompt, { model = 'anthropic/claude-3-haiku', maxTokens = 1024 } = {}) {
  return postOpenRouter({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
}

export async function generateCourseDescription(courseTitle, videoTitles) {
  const prompt = `You are an educational content organizer. Given this course and its video titles, write a concise, engaging course description (2-3 sentences).

Course: "${courseTitle}"

Videos:
${videoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Write ONLY the description, no title or extra formatting.`;

  return callOpenRouter(prompt);
}

export async function generateChapterSuggestions(videoTitles) {
  const prompt = `You are an educational content organizer. Given these video titles from a course, suggest logical chapter groupings.

Videos:
${videoTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return a JSON array of chapters, each with "title" (chapter name) and "videoIndices" (array of 1-based video indices).
Group related videos together logically. Return ONLY valid JSON, no markdown or explanation.

Example format: [{"title": "Introduction", "videoIndices": [1, 2, 3]}, {"title": "Advanced Topics", "videoIndices": [4, 5, 6]}]`;

  const response = await callOpenRouter(prompt);

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');

  return JSON.parse(jsonMatch[0]);
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

  const response = await callOpenRouter(prompt, { maxTokens: 2048 });
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI did not return valid quiz JSON');

  return JSON.parse(jsonMatch[0]);
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

  const response = await callOpenRouter(prompt, { maxTokens: 512 });
  const jsonMatch = response.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) throw new Error('AI did not return valid order JSON');

  return JSON.parse(jsonMatch[0]);
}

export async function generateVideoSummary(videoTitle, videoDescription) {
  const prompt = `You are an educational content summarizer. Given this video's title and description, write a concise 3-4 sentence summary of what this video likely covers. Focus on key topics and learning outcomes.

Video Title: "${videoTitle}"
Description: "${videoDescription || 'No description available'}"

Write ONLY the summary, no title or extra formatting.`;

  return callOpenRouter(prompt);
}

export async function chatWithContext(messages, videoTitle, videoDescription) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful AI tutor assisting a student who is watching a video lesson. Answer their questions clearly and concisely. Use the video context to provide relevant answers.

Video Title: "${videoTitle}"
Video Description: "${videoDescription || 'No description available'}"

Provide clear, educational responses. If the question is unrelated to the video topic, still try to help but note it's outside the video scope.`,
  };

  return postOpenRouter({
    model: 'anthropic/claude-3-haiku',
    max_tokens: 1024,
    messages: [systemMessage, ...messages],
  });
}
