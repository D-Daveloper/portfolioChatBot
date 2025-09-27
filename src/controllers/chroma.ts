import { ChromaClient } from "chromadb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Request, Response } from "express";
import { config } from "dotenv";
config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;


export const runtime = "nodejs";
//old way of getting the context from chroma
export const Chroma = async (req: Request,res:Response) => {
  const body = await req.body as { query: string };
  console.log(body);
  
  const client = new ChromaClient();
// console.log(docs[0].metadata.pdf, docs[0].metadata.loc);

  const googleEmbeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_API_KEY,
    model: "text-embedding-004", // 768 dime nsions
  });

  const embeddingFunction = {
    generate: async (texts: string[]) => {
        // GoogleGenerativeAIEmbeddings.embedDocuments returns Promise<number[][]>
        return await googleEmbeddings.embedDocuments(texts);
    },
};
const collection = await client.getOrCreateCollection({
    name: "resume1",
    embeddingFunction,
});
const existingCollections = await client.listCollections();
if (existingCollections.length > 1){
    console.log("Collection already exists, skipping PDF loading.");
}else{
      const loader = new PDFLoader("resume.pdf"); // Ensure resume.pdf exists in the project root or adjust path
      const docs = await loader.load();
      await collection.upsert({
        documents: docs.map((_)=> _.pageContent), // Add your documents here
        ids: docs.map((_, index) => `id${index + 1}`), // Generate unique IDs for each document
        metadatas: docs.map((_) => ({source: _.metadata.source})), //
    });
  }
  console.log("this is 1",collection);
  console.log("1523",existingCollections);
  

  const results = await collection.query({
    queryTexts: [body.query], // Chroma will embed this for you
    nResults: 10, // how many results to return
  });

  // console.log(results);
  return res.json(results);
};
export const Chroma1 = async (query :string) => {
//   const body = await req.body as { query: string };
const body = {  query: query};
  console.log(body);
  
  const client = new ChromaClient();
// console.log(docs[0].metadata.pdf, docs[0].metadata.loc);

  const googleEmbeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_API_KEY,
    model: "text-embedding-004", // 768 dimensions
  });

  const embeddingFunction = {
    generate: async (texts: string[]) => {
        // GoogleGenerativeAIEmbeddings.embedDocuments returns Promise<number[][]>
        return await googleEmbeddings.embedDocuments(texts);
    },
};
const collection = await client.getOrCreateCollection({
    name: "resume1",
    embeddingFunction,
});
const existingCollections = await client.listCollections();
if (existingCollections.length > 1){
    console.log("Collection already exists, skipping PDF loading.");
}else{
      const loader = new PDFLoader("resume.pdf"); // Ensure resume.pdf exists in the project root or adjust path
      const docs = await loader.load();
      await collection.upsert({
        documents: docs.map((_)=> _.pageContent), // Add your documents here
        ids: docs.map((_, index) => `id${index + 1}`), // Generate unique IDs for each document
        metadatas: docs.map((_) => ({source: _.metadata.source})), //
    });
  }
  console.log("this is 1",collection);
  console.log("1523",existingCollections);
  

  const results = await collection.query({
    queryTexts: [body.query], // Chroma will embed this for you
    nResults: 10, // how many results to return
  });

  // console.log(results);
//   return res.json(results);
  return JSON.stringify(results);
};

export function get(req:Request,res:Response){
    res.json({message: "hello world"})
}

// export const POST = async (req: Request) => {
//   const body = await req.json();
  
//   // Initialize ChromaClient with a persistent storage path
// const client = new ChromaClient();

//   const collectionName = "resume1";
//   const googleEmbeddings = new GoogleGenerativeAIEmbeddings({
//     apiKey: GOOGLE_API_KEY, // Use environment variable for security
//     model: "text-embedding-004", // 768 dimensions
//   });

//   const embeddingFunction = {
//     generate: async (texts: string[]) => {
//       return await googleEmbeddings.embedDocuments(texts);
//     },
//   };

//   // Check if collection already exists
//   let collection;
//   try {
//     collection = await client.getCollection({ name: collectionName });
//     console.log(`Collection ${collectionName} already exists, skipping PDF loading.`);
//   } catch (error) {
//     // Collection does not exist, load and upsert PDF
//     console.log(`Collection ${collectionName} not found, creating and loading PDF.`);
//     const loader = new PDFLoader("resume.pdf"); // Ensure resume.pdf exists in project root
//     const docs = await loader.load();
//     console.log("PDF loaded:", docs[0].metadata.pdf, docs[0].metadata.loc);

//     collection = await client.getOrCreateCollection({
//       name: collectionName,
//       embeddingFunction,
//     });

//     // Upsert documents to the collection
//     await collection.upsert({
//       documents: docs.map((doc) => doc.pageContent),
//       ids: docs.map((_, index) => `id${index + 1}`),
//       metadatas: docs.map((doc) => ({ source: doc.metadata.source })),
//     });
//     console.log(`Documents upserted to ${collectionName}`);
//   }

//   // Query the collection
//   const results = await collection.query({
//     queryTexts: [body.query],
//     nResults: 10,
//   });

//   return Response.json(results);
// };