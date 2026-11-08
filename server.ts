import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeCommand } from './src/lib/parser.js';
import { AnalysisResult, ShellType } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client lazily or safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: Command Analysis (Combines Rule-Based Static Parser with optional Gemini AI Enhancement)
app.post('/api/analyze', async (req, res) => {
  try {
    const { command, shell = 'bash' } = req.body as { command: string; shell: ShellType };

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command string is required.' });
    }

    // 1. Run deterministic static rule engine first
    const staticResult = analyzeCommand(command, shell as ShellType);

    // 2. Attempt AI enhancement if Gemini key is available
    const aiClient = getGeminiClient();
    if (!aiClient) {
      // Return rule-based static result directly
      return res.json({
        ...staticResult,
        technicalDetails: {
          ...staticResult.technicalDetails,
          aiEnhanced: false,
        },
      });
    }

    try {
      const prompt = `You are ShellGuard, a high-precision Linux/Bash command security analyst.
Review the following Linux/Bash command and the preliminary static rule analysis output.

Command: "${command}"
Shell: ${shell}
Static Analysis Risk Level: ${staticResult.riskLevel} (Score: ${staticResult.riskScore})
Static Summary: "${staticResult.summaryHeadline}"

Enhance the analysis by providing:
1. A concise, clear plain English explanation of exactly what this command does step-by-step.
2. A safer alternative command if applicable (or null if the command is already safe/optimal).
3. Explanation of why the alternative is safer.
4. Any additional specific security or operational risk notes.

Output strictly valid JSON matching the schema.`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plainEnglishExplanation: {
                type: Type.STRING,
                description: 'Clear plain English explanation of command behavior',
              },
              summaryHeadline: {
                type: Type.STRING,
                description: 'Concise, high-level summary headline',
              },
              saferCommand: {
                type: Type.STRING,
                description: 'Safer command alternative, or empty string if none needed',
              },
              saferExplanation: {
                type: Type.STRING,
                description: 'Why the alternative is safer',
              },
            },
            required: ['plainEnglishExplanation', 'summaryHeadline'],
          },
        },
      });

      if (aiResponse.text) {
        const parsedAI = JSON.parse(aiResponse.text.trim());

        const mergedResult: AnalysisResult = {
          ...staticResult,
          summaryHeadline: parsedAI.summaryHeadline || staticResult.summaryHeadline,
          plainEnglishExplanation: parsedAI.plainEnglishExplanation || staticResult.plainEnglishExplanation,
          saferAlternative: parsedAI.saferCommand
            ? {
                command: parsedAI.saferCommand,
                explanation: parsedAI.saferExplanation || 'Provides equivalent outcome with reduced risk and improved safety checks.',
                diff: [
                  { type: 'removed', text: command },
                  { type: 'added', text: parsedAI.saferCommand },
                ],
              }
            : staticResult.saferAlternative,
          technicalDetails: {
            ...staticResult.technicalDetails,
            confidence: 99,
            aiEnhanced: true,
          },
        };

        return res.json(mergedResult);
      }
    } catch (aiError) {
      console.warn('Gemini AI enrichment unavailable, falling back to rule engine:', aiError);
    }

    // Fallback to static result if AI call fails
    return res.json({
      ...staticResult,
      technicalDetails: {
        ...staticResult.technicalDetails,
        aiEnhanced: false,
      },
    });
  } catch (error) {
    console.error('Error analyzing command:', error);
    return res.status(500).json({ error: 'Internal server error while analyzing command.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShellGuard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
