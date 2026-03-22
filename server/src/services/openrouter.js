const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callOpenRouter(prompt, { model = 'anthropic/claude-3-haiku', maxTokens = 1024 } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://coursession.ai',
      'X-Title': 'CoursessionAI',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
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
  const prompt = `You are an educational quiz generator. Given this video's title and description, generate 5 multiple-choice quiz questions to test understanding.

Video Title: "${videoTitle}"
Description: "${videoDescription || 'No description available'}"

Return ONLY a valid JSON array of 5 questions. Each question must have:
- "question": the question text
- "options": array of exactly 4 answer choices
- "correctAnswer": index (0-3) of the correct option

Example: [{"question": "What is...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]`;

  const response = await callOpenRouter(prompt, { maxTokens: 2048 });
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI did not return valid quiz JSON');

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const systemMessage = {
    role: 'system',
    content: `You are a helpful AI tutor assisting a student who is watching a video lesson. Answer their questions clearly and concisely. Use the video context to provide relevant answers.

Video Title: "${videoTitle}"
Video Description: "${videoDescription || 'No description available'}"

Provide clear, educational responses. If the question is unrelated to the video topic, still try to help but note it's outside the video scope.`,
  };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://coursession.ai',
      'X-Title': 'CoursessionAI',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      max_tokens: 1024,
      messages: [systemMessage, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}
