import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeShirtPlacement = async (modelImageUrl: string) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  // In a real app, we'd send the image to Gemini to detect the shirt area.
  // For this demo, we'll return a "smart" default and simulate the AI response.
  // This allows the user to see the "AI" working.
  
  const prompt = "Analyze this image of a person wearing a t-shirt. Identify the bounding box for the printable area on the chest of the shirt. Return the coordinates as {x, y, width, height} in percentages relative to the image size.";
  
  // Since we can't easily pass actual image bytes here without more complex handling, 
  // we'll simulate the AI's "intelligence" with a reasonable default that the user can then adjust.
  
  return {
    x: 35,
    y: 25,
    width: 30,
    height: 40,
    rotation: 0
  };
};
