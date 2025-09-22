import express from "express";
import { config } from "dotenv";
import chatRoutes from "./routes/chat";
import chromaRoutes from "./routes/chroma";
import cors from "cors";
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

app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`);  
})