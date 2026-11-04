
const openai = require("../config/openai");

async function askGPT(question, chunks = []) {
  const context = chunks
    .map((chunk) => chunk.text)
    .filter(Boolean)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: process.env.CHAT_MODEL || "openai/gpt-4o-mini",

    messages: [
      {
        role: "system",
        content: `
You are an intelligent AI assistant with two knowledge sources.

SOURCE 1: General AI knowledge.
SOURCE 2: Uploaded document context.

RULES:

1. For general questions about programming, JavaScript, React,
Node.js, SQL, technology, education, definitions and concepts,
answer using your general knowledge.

2. For questions about company policies, uploaded documents,
company information, or specific document content,
answer ONLY using the provided document context.

3. If the user asks a document-specific question and the
information is missing from the context, respond:
"I couldn't find this information in the uploaded document."

4. Never invent company-specific information.

5. If the question is about account usage, remaining tokens,
credits, subscription balance or billing, do not guess.
Explain that this information must be retrieved from the
application's account or billing API.

6. Give clear and useful answers with examples when appropriate.

7. Do not reject general questions just because the uploaded
document does not contain the answer.
        `
      },
      {
        role: "user",
        content: `
Uploaded document context:
${context || "No relevant document context found."}

Question:
${question}
        `
      }
    ],

    temperature: 0,
    max_tokens: 700
  });

  return response.choices[0].message.content;
}

module.exports = { askGPT };
