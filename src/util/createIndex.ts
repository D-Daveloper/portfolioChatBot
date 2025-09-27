import { MongoClient } from 'mongodb';
import { getClient } from "../db/dbClient";
export async function runIndex(client: MongoClient) {
    try {
    //   const client = await getClient();
      const database = client.db("resumeDB");
      const collection = database.collection("test");
     
      // Define your Vector Search index
      const index = {
          name: "vector_index",
          type: "vectorSearch",
          definition: {
            "fields": [
              {
                "type": "vector",
                "path": "embedding",
                "similarity": "cosine",
                "numDimensions": 768 // Replace with the number of dimensions of your embeddings
              }
            ]
          }
      }
 
      // Call the method to create the index
      const result = await collection.createSearchIndex(index);
      console.log(result);
    }catch (err) {
        console.log(err);
    }
}

