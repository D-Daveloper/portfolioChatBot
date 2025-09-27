import express from "express";
import { config } from "dotenv";
import chatRoutes from "./routes/chat";
import chromaRoutes from "./routes/chroma";
import cors from "cors";
import { run } from "./util/seedDB";
import { runIndex } from "./util/createIndex";
import { closeClient, getClient } from "./db/dbClient";
import { get } from "http";
import { getQueryResults } from "./util/getQuery";
config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.use("/api/",chatRoutes);
app.use("/api/",chromaRoutes);

app.listen(PORT,async() =>{
    console.log(`Server is running on port ${PORT}`); 
    const client = await getClient();
    run(client).catch(console.dir);
    // runIndex(client).catch(console.dir);
 
})
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');
      await closeClient();
      process.exit(0);
  });
  process.on('SIGTERM', async () => {
      console.log('Shutting down gracefully...');
      await closeClient();
      process.exit(0);
  });