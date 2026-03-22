import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { HelperType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const HELPER_VOICES: Record<HelperType, string> = {
  'MONO': 'Charon',
  'C-BOT': 'Puck',
  'HEX': 'Zephyr',
  'LENTE': 'Fenrir'
};

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 8): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || "";
      const isRateLimit = errorMessage.includes('429') || 
                          error.status === 'RESOURCE_EXHAUSTED' || 
                          errorMessage.includes('quota') ||
                          errorMessage.includes('rate limit');

      if (isRateLimit) {
        // Exponential backoff: 3s, 6s, 12s, 24s, 48s...
        const delay = Math.pow(2, i) * 3000 + Math.random() * 1000;
        console.warn(`[Gemini API] Límite de cuota alcanzado. Reintentando en ${Math.round(delay/1000)}s (Intento ${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateInterviewQuestion(role: string, history: { role: 'user' | 'model', text: string }[]) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Eres un experto entrevistador para el puesto de ${role}. 
  Tu objetivo es realizar una entrevista profesional, desafiante y realista.
  Habla SIEMPRE en español.
  Haz una pregunta a la vez. 
  Mantén tus respuestas concisas y enfocadas en la entrevista.
  Si el usuario da una respuesta, evalúala brevemente mentalmente y luego haz la siguiente pregunta lógica o una de seguimiento.
  Si el usuario pide una aclaración, proporciónala.
  La entrevista debe durar entre 5 y 7 preguntas.`;

  let contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  if (contents.length === 0) {
    contents = [{
      role: 'user',
      parts: [{ text: "Hola, estoy listo para comenzar la entrevista." }]
    }];
  }

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  });
}

export async function generateFeedback(role: string, history: { role: 'user' | 'model', text: string }[]) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Eres un experto coach de entrevistas. 
  Analiza la siguiente transcripción de entrevista para el puesto de ${role}.
  Proporciona un informe de retroalimentación detallado en formato JSON.
  El informe debe incluir:
  - overallScore (0-100)
  - skillScores: un array de objetos con { label: string, score: number } (ej., Profundidad Técnica, Comunicación, Confianza)
  - tips: un array de objetos con { title: string, desc: string }
  - summary: un breve resumen del desempeño.
  Toda la información de texto dentro del JSON debe estar en español.`;

  const transcript = history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join('\n');

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Analyze this interview transcript:\n\n${transcript}` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || '{}');
  });
}

export async function generateSpeech(text: string, helperType: HelperType = 'C-BOT') {
  const voiceName = HELPER_VOICES[helperType] || 'Puck';
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  });
}
