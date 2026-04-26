import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.post('/', expressAsyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!process.env.GEMINI_API_KEY) {
     return res.json({ reply: "I am currently running in offline mock mode since the Gemini API key isn't provided! But yes, we do sell watches under 5000 PKR. Have a look around!", suggestions: [] });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a helpful virtual assistant for an e-commerce platform named AllAvailable. Keep your answer under 3 sentences. User asks: ${message}`
    });
    
    res.json({ reply: response.text, suggestions: [] });
  } catch(err) {
    console.error(err);
    res.status(500); throw new Error('AI Engine failed to process query');
  }
}));

export default router;
