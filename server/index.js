import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// File upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.docx'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Models to try in order (fallback chain)
// gemini-3.5-flash and gemini-3.5-flash-lite have active free-tier quota and low latency
const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.6-flash',
];

// Retry helper with model fallback
async function callGemini(prompt, maxRetriesPerModel = 2) {
  let lastError = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
      try {
        console.log(`🤖 Trying ${model} (attempt ${attempt + 1})...`);
        const response = await genAI.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        console.log(`✅ Success with ${model}`);
        return response;
      } catch (err) {
        lastError = err;
        const status = err.status || err.code;
        const errMsg = err.message || '';

        console.log(`⚠️ ${model} error (attempt ${attempt + 1}, status ${status}):`, errMsg.slice(0, 150));

        // If quota exceeded or model not found, don't keep retrying this model - switch immediately
        if (status === 404 || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          console.log(`⏭️ Skipping ${model} due to quota/availability, trying next model...`);
          break;
        }

        if (status === 503 || status === 429) {
          if (attempt < maxRetriesPerModel - 1) {
            const delay = 2000;
            console.log(`⏳ ${model} busy (${status}), retrying in ${delay/1000}s...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
        }

        // For other unrecoverable errors (like auth error 401/403)
        if (status === 401 || status === 403) {
          throw err;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini models are currently unavailable. Please try again later.');
}

// ============================================
// ENDPOINT: Parse Document
// ============================================
app.post('/api/parse-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = extname(req.file.originalname).toLowerCase();
    let text = '';
    const title = req.file.originalname.replace(/\.[^/.]+$/, '');

    if (ext === '.txt') {
      text = req.file.buffer.toString('utf-8');
    } else if (ext === '.pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(req.file.buffer);
      text = result.text;
    } else if (ext === '.docx') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    }

    // Trim and clean text
    text = text.replace(/\s+/g, ' ').trim();

    if (!text || text.length < 10) {
      return res.status(400).json({ message: 'Could not extract meaningful text from document' });
    }

    res.json({ text, title });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ message: 'Failed to parse document' });
  }
});

// ============================================
// ENDPOINT: Generate Lesson
// ============================================
app.post('/api/generate-lesson', async (req, res) => {
  try {
    const { text, type, lang = 'vi', count = 10 } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    // Truncate text if too long (keep first 15000 chars)
    const truncatedText = text.length > 15000 ? text.substring(0, 15000) : text;
    const langName = lang === 'vi' ? 'Vietnamese' : 'English';

    let prompt = '';

    if (type === 'flashcard') {
      prompt = `You are an educational AI. Based on the following text, create ${count} flashcards for studying.
Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "title": "Lesson title in ${langName}",
  "description": "Brief description in ${langName}",
  "difficulty": 1-5 (integer),
  "content": [
    {"front": "question or term in ${langName}", "back": "answer or definition in ${langName}"}
  ]
}

The flashcards should cover the key concepts, terms, and important facts from the text.
Make them concise but comprehensive. Respond in ${langName}.

TEXT:
${truncatedText}`;
    } else if (type === 'quiz') {
      prompt = `You are an educational AI. Based on the following text, create ${count} multiple-choice quiz questions.
Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "title": "Quiz title in ${langName}",
  "description": "Brief description in ${langName}",
  "difficulty": 1-5 (integer),
  "content": [
    {
      "question": "question text in ${langName}",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_index": 0,
      "explanation": "why this answer is correct, in ${langName}"
    }
  ]
}

Each question should have exactly 4 options with only one correct answer.
correct_index is 0-based (0=A, 1=B, 2=C, 3=D).
Make questions that test understanding, not just memorization. Respond in ${langName}.

TEXT:
${truncatedText}`;
    } else if (type === 'essay') {
      prompt = `You are an educational AI. Based on the following text, create ${count} essay/open-ended questions.
Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "title": "Essay title in ${langName}",
  "description": "Brief description in ${langName}",
  "difficulty": 1-5 (integer),
  "content": [
    {
      "question": "open-ended question in ${langName}",
      "rubric": "grading criteria in ${langName}",
      "sample_answer": "example of a good answer in ${langName}"
    }
  ]
}

Create thought-provoking questions that require analysis and synthesis of the material. Respond in ${langName}.

TEXT:
${truncatedText}`;
    }

    const response = await callGemini(prompt);

    const responseText = response.text || '';
    
    // Parse JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ message: 'Failed to generate lesson. Check your Gemini API key.' });
  }
});

// ============================================
// ENDPOINT: Grade Essay
// ============================================
app.post('/api/grade-essay', async (req, res) => {
  try {
    const { question, answer, rubric, sampleAnswer, lang = 'vi' } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const langName = lang === 'vi' ? 'Vietnamese' : 'English';

    const prompt = `You are a teacher grading a student's essay answer.
Return ONLY a valid JSON object (no markdown, no code fences):
{
  "score": <number 0-10>,
  "maxScore": 10,
  "feedback": "detailed feedback in ${langName}"
}

QUESTION: ${question}
RUBRIC: ${rubric}
SAMPLE ANSWER: ${sampleAnswer}
STUDENT'S ANSWER: ${answer}

Grade based on:
1. Content accuracy (40%)
2. Logical reasoning (30%)
3. Detail and completeness (30%)

Be encouraging but honest. Provide specific suggestions for improvement.
Respond in ${langName}.`;

    const response = await callGemini(prompt);

    const responseText = response.text || '';
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Grade error:', error);
    res.status(500).json({ message: 'Failed to grade essay' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HocThuXem API Server running on http://localhost:${PORT}`);
  console.log(`📝 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
});
