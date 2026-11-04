const db = require("../config/db");

const { createEmbedding } = require("./embeddingService");

const cosineSimilarity = require("./similarityService");

async function searchChunks(question) {

    const questionEmbedding = await createEmbedding(question);

    const [rows] = await db.execute(

        "SELECT * FROM document_chunks"

    );

    const results = rows
    .filter(row => row.embedding)
    .map(row => {

        const embedding = JSON.parse(row.embedding);

        return {

            text: row.chunk_text,

            score: cosineSimilarity(
                questionEmbedding,
                embedding
            )

        };

    });

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 3);

}

module.exports = {

    searchChunks

};