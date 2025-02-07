import mysql from 'mysql';

import dotenv from 'dotenv';
dotenv.config();

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS ai_models (
//   id int(11) NOT NULL,
//   model_name varchar(300) DEFAULT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

// INSERT INTO ai_models (id, model_name) VALUES
// (1, 'llama-3.3-70b-versatile'),
// (3, 'llama-3.1-8b-instant'),
// (4, 'llama-guard-3-8b'),
// (5, 'llama3-70b-8192'),
// (6, 'llama3-8b-8192'),
// (7, 'mixtral-8x7b-32768'),
// (8, 'whisper-large-v3'),
// (9, 'whisper-large-v3-turbo');

// CREATE TABLE IF NOT EXISTS users (
//   id int(11) NOT NULL,
//   name varchar(256) NOT NULL,
//   password text NOT NULL,
//   email varchar(256) NOT NULL,
//   ai_model int(11) NOT NULL DEFAULT 0,
//   default_prompt text NOT NULL DEFAULT 'You are a helpful assistant responds to and create engaging tweets.',
//   twitter_api_key text DEFAULT NULL,
//   twitter_api_secret text DEFAULT NULL,
//   twitter_access_token text DEFAULT NULL,
//   twitter_access_secret text DEFAULT NULL,
//   groq_api_key text DEFAULT NULL,
//   twitter_bearer_token text DEFAULT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

// ALTER TABLE ai_models
//   ADD PRIMARY KEY (id);
// ALTER TABLE users
//   ADD PRIMARY KEY (id);
// ALTER TABLE ai_models
//   MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
// ALTER TABLE users
//   MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
// COMMIT;
//     `;

// Connect to the database
connection.connect(async (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('DBConnected');
});

export default connection;
