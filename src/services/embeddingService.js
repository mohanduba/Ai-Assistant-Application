const openai = require("../config/openai");

async function createEmbedding(text) {

    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text
    });

    console.log("Embedding Response:");
    console.log(JSON.stringify(response, null, 2));

    if (!response.data || response.data.length === 0) {
        throw new Error("Embedding generation failed.");
    }

    return response.data[0].embedding;
}

module.exports = {
    createEmbedding
};