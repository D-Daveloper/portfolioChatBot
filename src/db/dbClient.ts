// db-client.js
import { MongoClient } from 'mongodb';

let client:MongoClient; // Module-level singleton variable
let isConnected = false; // Track connection state

// Connection options with timeouts
const connectionOptions = {
    serverSelectionTimeoutMS: 50000,  // Wait up to 5s to select a server
    socketTimeoutMS: 45000,          // Wait up to 45s for socket operations (e.g., queries)
    connectTimeoutMS: 10000,         // Wait up to 10s to establish connection
    maxPoolSize: 10,                 // Limit pool to 10 connections (adjust based on load)
    retryWrites: true,               // Enable retryable writes
    // Add more if needed, e.g., authSource: 'admin' for custom auth
};

export async function getClient() {
    if (client && isConnected) {
        return client; // Reuse if already connected
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(process.env.MONGODB_URI, connectionOptions);

    try {
        await client.connect();
        isConnected = true;
        console.log('Connected to MongoDB successfully');
        return client;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        // Optionally, destroy the client on failure
        if (client) {
            await client.close();
        }
        throw error; // Re-throw for caller to handle
    }
}

// Optional: Export a function to close the client (call on app shutdown)
export async function closeClient() {
    if (client && isConnected) {
        await client.close();
        isConnected = false;
        console.log('MongoDB connection closed');
    }
}
