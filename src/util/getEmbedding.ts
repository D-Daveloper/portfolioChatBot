import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function getEmbedding(text: string): Promise<number[]> {    
      const googleEmbeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "text-embedding-004", // 768 dimensions
      });
    return (await googleEmbeddings.embedDocuments([text])).flat();
}