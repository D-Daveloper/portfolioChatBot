import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoClient } from 'mongodb';
import { getClient } from "../db/dbClient";
// import { getEmbedding } from './get-embeddings.js';
// import * as fs from 'fs';
  const googleEmbeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004", // 768 dime nsions
  });
export async function run(client: MongoClient) {

    try {
        const db = client.db();
        const collection = db.collection("test");
        if (await collection.countDocuments() > 0) {
            console.log("Collection already exists, skipping PDF loading.");
            return;
        }
        const loader = new PDFLoader(`resume.pdf`);
        const data = await loader.load();

        // Chunk the text from the PDF
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 400,
            chunkOverlap: 20,
        });

        const docs = await textSplitter.splitDocuments(data);
        console.log(`Successfully chunked the PDF into ${docs.length} documents.`);


        console.log("Generating embeddings and inserting documents...");
        const insertDocuments = [] as { document: any, embedding: number[][] }[];
        await Promise.all(docs.map(async doc => {

            // Generate embeddings using the function that you defined
            const embedding = await googleEmbeddings.embedDocuments([doc.pageContent]);
            // console.log("Embedding generated", embedding);

            // Add the document with the embedding to array of documents for bulk insert
            insertDocuments.push({
                document: doc,
                embedding: embedding
            });
        }))

        // Continue processing documents if an error occurs during an operation
        const options = { ordered: false };

        // Insert documents with embeddings into collection
        const result = await collection.insertMany(insertDocuments, options);  
        console.log("Count of documents inserted: " + result.insertedCount); 

    } catch (err) {
        console.log(err);
    }
}
