import {
  Message as VercelChatMessage,
  StreamingTextResponse,
} from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGroq } from "@langchain/groq";
import { Request, Response } from "express";
import { Chroma1 } from "./chroma";
export const dynamic = "force-dynamic";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `Answer the user's questions based only on the following context. If the answer is not in the context, reply politely that you do not have that information available.:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;

export const runtime = "edge";

const createStreamDataTransformer = () => {
  return new TransformStream({
    transform(chunk, controller) {
      const decoder = new TextDecoder('utf-8');
      const transformedChunk = decoder.decode(chunk);
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(transformedChunk));
    }
  });
}

export async function Chat(req: Request,res: Response) {
  try {
    
    const messages = req.body.messages;
    console.log("Received messages:", req.body);
    console.log("Received messages:", messages);

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    console.log("Current message content:", currentMessageContent);
    // Fetch context from Node route
    const res = await Chroma1(currentMessageContent);
    const results = await JSON.parse(res) as { documents: any[][] };
    console.log("Context results:", results);
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY, // Ensure you have this environment variable set
      model: "llama-3.3-70b-versatile",
    });

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    // Create a ReadableStream to handle the streaming response
    const textStream = new ReadableStream({
      async start(controller) {
        const stream = await chain.stream({
          chat_history: formattedPreviousMessages.join("\n"),
          context: results.documents[0][0],
          question: currentMessageContent,
        });
        let i =0 ;
        let fullResponse = "";
        for await (const chunk of stream) {
          if (typeof chunk === "string") {
            fullResponse += chunk;
          
        }
    }
    const data = {
        type: "message",
        data:{
            id: `msg_${Date.now()}_${i++}`,
            role: "assistant",
            content: fullResponse,
            createdAt: new Date().toISOString() 
        }
    };
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        controller.close();
      },
    });    

    // Respond with the stream, transformed if necessary
    return new StreamingTextResponse(
      textStream.pipeThrough(createStreamDataTransformer())
    );

  } catch (e: any) {
    console.error("Error:", e);
    return res.status(500).json({ error: e.message });
  }
}
export async function oldMethod(req: Request,res: Response) {
  try {
    
    const messages = req.body.messages;
    console.log("Received messages:", req.body);
    console.log("Received messages:", messages);

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    console.log("Current message content:", currentMessageContent);
    

    // Fetch context from Node route
    const res = await fetch(
      `${process.env.BASE_URL}/api/chroma`,
      {
        method: "POST",
        body: JSON.stringify({ query: currentMessageContent }),
      }
    );
    console.log(res);
    const results = await res.json() as { documents: any[][] };
    console.log("Context results:", results);
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY, // Ensure you have this environment variable set
      model: "llama-3.3-70b-versatile",
      // model: "llama3-8b-8192",
    });

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    // Create a ReadableStream to handle the streaming response
    const textStream = new ReadableStream({
      async start(controller) {
        const stream = await chain.stream({
          chat_history: formattedPreviousMessages.join("\n"),
          context: results.documents[0][0],
          question: currentMessageContent,
        });
        let i =0 ;
        let fullResponse = "";
        for await (const chunk of stream) {
          if (typeof chunk === "string") {
            fullResponse += chunk;
          
        }
    }
    const data = {//new
        type: "message",
        data:{
            id: `msg_${Date.now()}_${i++}`,
            role: "assistant",
            content: fullResponse,
            createdAt: new Date().toISOString() 
        }
    };
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        controller.close();
      },
    });    

    // Respond with the stream, transformed if necessary
    return new StreamingTextResponse(
      textStream.pipeThrough(createStreamDataTransformer())
    );

  } catch (e: any) {
    console.error("Error:", e);
    return res.status(500).json({ error: e.message });
  }
}
export function get(req:Request,res:Response){
    res.json({message: "hello world"})
}
