import { MongoClient } from 'mongodb';
import { getEmbedding } from './getEmbedding';

// Function to get the results of a vector query
export async function getQueryResults(query:string, client: MongoClient) {
    // Connect to your Atlas cluster
    try {
        // Get embedding for a query
        const queryEmbedding = await getEmbedding(query);
        const db = client.db();
        const collection = db.collection("test");

        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index",
                    queryVector: queryEmbedding,
                    path: "embedding",
                    exact: true,
                    limit: 5
                }
            },
            {
                $project: {
                    _id: 0,
                    document: 1,
                }
            }
        ];

        // Retrieve documents using a Vector Search query
        const result = collection.aggregate(pipeline);

        const arrayOfQueryDocs = [];
        for await (const doc of result) {
            arrayOfQueryDocs.push(doc);
        }
        return arrayOfQueryDocs;
    } catch (err) {
        console.log(err);
        return [];
    }
}
