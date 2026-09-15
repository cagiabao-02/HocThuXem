const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function parseDocument(file: File): Promise<{ text: string; title: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/parse-document`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to parse document');
  }

  return response.json();
}

export async function generateLesson(
  text: string,
  type: 'flashcard' | 'quiz' | 'essay',
  lang: string = 'vi',
  count: number = 10
): Promise<any> {
  const response = await fetch(`${API_URL}/api/generate-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type, lang, count }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate lesson');
  }

  return response.json();
}

export async function gradeEssay(
  question: string,
  answer: string,
  rubric: string,
  sampleAnswer: string,
  lang: string = 'vi'
): Promise<{ score: number; maxScore: number; feedback: string }> {
  const response = await fetch(`${API_URL}/api/grade-essay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, rubric, sampleAnswer, lang }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to grade essay');
  }

  return response.json();
}
