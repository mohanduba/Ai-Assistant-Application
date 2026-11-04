const db = require("../config/db");

const { extractText } = require("../services/pdfService");
const { createEmbedding } = require("../services/embeddingService");
const { searchChunks } = require("../services/ragService");
const { askGPT } = require("../services/chatService");

const splitText = require("../services/splitter");

exports.uploadDocument = async (req, res) => {

    try {

        const file = req.file;

        if (!file) {

            return res.status(400).json({

                message: "No File Uploaded"

            });

        }

        // Save PDF Information

        const [result] = await db.execute(

            `INSERT INTO documents(file_name,file_path)

            VALUES(?,?)`,

            [

                file.originalname,

                file.path

            ]

        );

        const documentId = result.insertId;

        // Read PDF

        const text = await extractText(file.path);

        // Split PDF

        const chunks = splitText(text);

        // Save Chunks

        for (let i = 0; i < chunks.length; i++) {

            const embedding = await createEmbedding(chunks[i]);

            await db.execute(

                `INSERT INTO document_chunks
                (document_id, chunk_index, chunk_text, embedding)
                VALUES (?, ?, ?, ?)`,

                [
                    documentId,
                    i + 1,
                    chunks[i],
                    JSON.stringify(embedding)
                ]

            );

        }

        res.json({

            message: "PDF Processed Successfully",

            chunks: chunks.length

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: err.message

        });

    }

};



exports.askQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        // 1. Retrieve relevant document chunks
        const chunks = await searchChunks(question);

        // 2. Generate AI answer
        const answer = await askGPT(question, chunks || []);

        // 3. Save question and answer in MySQL
        const [result] = await db.execute(
            `INSERT INTO chat_history (question, answer)
             VALUES (?, ?)`,
            [question, answer]
        );

        // 4. Return response
        return res.json({
            id: result.insertId,
            question,
            answer,
            chunks: chunks || []
        });

    } catch (err) {
        console.error("Ask Question Error:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, question, answer, created_at
             FROM chat_history
             ORDER BY created_at ASC`
        );

        return res.json({
            history: rows
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: err.message
        });
    }
};


