import connection from '../utils/db';

// initialise the database
export const init_db = async () => {
    try {
        const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      twitter_api_key TEXT,
      twitter_api_secret TEXT,
      twitter_access_token TEXT,
      twitter_access_secret TEXT,
      twitter_bearer_token TEXT,
      groq_api_key TEXT
    )`;

        await new Promise((resolve, reject) => {
            connection.query(createUsersTable, (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });

        console.log('Users table created successfully');
    } catch (error) {
        console.error('Error creating users table:', error);
    }
};
