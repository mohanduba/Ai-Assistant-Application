const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let sslConfig;

// Render deployment: Read certificate from environment variable
if (process.env.DB_SSL_CA) {
  sslConfig = {
    ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n")
  };
}
// Local development or file-based CA
else if (process.env.DB_SSL_CA_PATH) {
  const caPath = path.resolve(
    process.cwd(),
    process.env.DB_SSL_CA_PATH
  );

  if (fs.existsSync(caPath)) {
    sslConfig = {
      ca: fs.readFileSync(caPath)
    };
  } else {
    console.warn(`[db.js] Notice: CA cert file not found at "${caPath}". Using SSL with rejectUnauthorized: false.`);
    sslConfig = {
      rejectUnauthorized: false
    };
  }
} else {
  sslConfig = {
    rejectUnauthorized: false
  };
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: sslConfig,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
