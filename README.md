# Twitter Chatbot Application

This application is a Twitter chatbot built using Node.js, EJS for frontend rendering, MySQL for database storage, the `twitter-api-v2` library for Twitter interaction, and the `groq-sdk` for AI model integration.  It allows users to configure their Twitter API credentials, select an AI model, and generate and post tweets based on keywords or AI-generated responses.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication:**  Securely stores and manages user's Twitter API credentials (encrypted).
- **AI Model Selection:** Allows users to choose from available AI models (integrated via the Groq SDK).
- **Keyword-Based Tweet Generation:** Generates tweets based on user-provided keywords.
- **AI-Powered Tweet Generation:** Generates tweets using the selected AI model based on keywords.
- **Automated Tweet Posting:** Automatically posts generated tweets to Twitter.
- **User Interface:**  Provides a user-friendly web interface for configuration and interaction.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** EJS (Embedded JavaScript)
- **Database:** MySQL
- **Twitter Integration:** `twitter-api-v2`
- **AI Integration:** `groq-sdk`
- **Other:**  `dotenv` (for environment variables)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ImStillBlessed/twitter-chatbot-js.git  # Replace with your repo URL
    cd twitter-chatbot-js
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file:**

    Copy the `.env.example` file to `.env` and fill in the required environment variables (see [Configuration](#configuration) section).

## Configuration

1. **Environment Variables (`.env`):**

    ```bash
    DB_HOST=[your_mysql_host]
    DB_USER=[your_mysql_user]
    DB_PASSWORD=[your_mysql_password]
    DB_NAME=[your_mysql_database_name]
    PORT=[port_number] //optional if not provided defaults to 3001
    CRYPTO_SECRET=[32 character secret key for encryption]
    ```

2. **MySQL Database:**

    Create a MySQL database with the name specified in the `.env` file (`DB_NAME`).  The application will create the necessary tables automatically on the first run.  The database schema is described in the [Database Schema](#database-schema) section.

## Database Schema

The MySQL database contains two tables: `ai_models` and `users`.

**1. `ai_models` Table:**

This table stores information about the available AI models.

| Column        | Type          | Description                               |
| ------------- | ------------- | ----------------------------------------- |
| `id`          | INT(11)       | Primary Key, Auto-incrementing           |
| `model_name`  | VARCHAR(300)  | Name of the AI model                     |

*Initial Data:*

The `ai_models` table is pre-populated with the following AI models:

| id | model_name                |
|----|---------------------------|
| 1  | llama-3.3-70b-versatile    |
| 3  | llama-3.1-8b-instant       |
| 4  | llama-guard-3-8b           |
| 5  | llama3-70b-8192           |
| 6  | llama3-8b-8192           |
| 7  | mixtral-8x7b-32768        |
| 8  | whisper-large-v3          |
| 9  | whisper-large-v3-turbo      |

**2. `users` Table:**

This table stores user information and their API credentials.

| Column               | Type          | Description                                                                 |
| -------------------- | ------------- | --------------------------------------------------------------------------- |
| `id`                 | INT(11)       | Primary Key, Auto-incrementing                                               |
| `name`               | VARCHAR(256)  | User's name                                                               |
| `password`           | TEXT          | User's password (should be hashed for security)                             |
| `email`              | VARCHAR(256)  | User's email address                                                        |
| `ai_model`           | INT(11)       | Foreign key referencing `ai_models.id`, ID of the user's selected AI model. Defaults to 0 |
| `default_prompt`     | TEXT          | Default prompt for AI responses. Defaults to: "You are a helpful assistant responds to and create engaging tweets." |
| `twitter_api_key`    | TEXT          | Encrypted Twitter API Key                                                  |
| `twitter_api_secret` | TEXT          | Encrypted Twitter API Secret                                               |
| `twitter_access_token` | TEXT          | Encrypted Twitter Access Token                                              |
| `twitter_access_secret` | TEXT          | Encrypted Twitter Access Secret                                           |
| `groq_api_key`       | TEXT          | Encrypted Groq API Key                                                     |
| `twitter_bearer_token` | TEXT          | Encrypted Twitter Bearer Token                                                |

**Table Relationships:**

- The `users` table has a foreign key relationship with the `ai_models` table via the `ai_model` column.  This links a user to their selected AI model.

**SQL Statements for Table Creation:**

The following SQL statements are used to create the tables and insert the initial data into the `ai_models` table.  These statements are executed by the application on the first run to set up the database.

```sql
CREATE TABLE IF NOT EXISTS ai_models (
  id int(11) NOT NULL,
  model_name varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO ai_models (id, model_name) VALUES
(1, 'llama-3.3-70b-versatile'),
(3, 'llama-3.1-8b-instant'),
(4, 'llama-guard-3-8b'),
(5, 'llama3-70b-8192'),
(6, 'llama3-8b-8192'),
(7, 'mixtral-8x7b-32768'),
(8, 'whisper-large-v3'),
(9, 'whisper-large-v3-turbo');

CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL,
  name varchar(256) NOT NULL,
  email varchar(256) NOT NULL,
  ai_model int(11) NOT NULL DEFAULT 0,
  default_prompt text NOT NULL DEFAULT 'You are a helpful assistant responds to and create engaging tweets.',
  twitter_api_key text DEFAULT NULL,
  twitter_api_secret text DEFAULT NULL,
  twitter_access_token text DEFAULT NULL,
  twitter_access_secret text DEFAULT NULL,
  groq_api_key text DEFAULT NULL,
  twitter_bearer_token text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE ai_models
  ADD PRIMARY KEY (id);
ALTER TABLE users
  ADD PRIMARY KEY (id);
ALTER TABLE ai_models
  MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
ALTER TABLE users
  MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;
```

## Usage

1. **Run the application:**

    ```bash
    npm start
    ```

2. **Access the application:**

    Open your web browser and go to `http://localhost:[port]` (default port is 3001, or the port you specified in `.env`).

3. **Setup:**
    - Navigate to the `/setup` route to enter and save your Twitter API credentials and Groq API key.  These keys are encrypted before being stored in the database.
4. **Home Page:**
    - The home page displays the welcome message and lists the available (partially masked) API keys.
    - Enter keywords in the input field.
    - Click "Generate from Tweet" to generate a tweet based on recent tweets in your timeline that match the keywords.
    - Click "AI Generate from keywords" to generate a tweet using the AI model based on the keywords.
    - The generated tweet will be displayed.
    - Click "Post Tweet" to post the generated tweet to Twitter.

## API Endpoints

- **GET `/`:**  Renders the home page, fetches user data (including partially masked keys), and makes it available to the EJS template.
- **GET `/setup`:** renders the setup page for inputting api keys
- **POST `/setup/save`:** Handles saving the setup configuration (api keys) to the database after encryption.
- **GET `/api/setup`:** Renders the `save_credentials` page.
- **GET `/api/edit_credentials`:** Retrieves the user's encrypted API keys.
- **POST `/api/edit_credentials`:** Handles editing and saving updated API keys.
- **POST `/api/get_tweet`:** Generates a tweet by searching the user timeline for a matching tweet based on the keywords in the request body.
- **POST `/api/post_tweet`:** Posts a tweet to Twitter. The tweet text is in the request body.
- **POST `/api/ai-response`:** Generates an AI-powered tweet using the Groq SDK. The keywords are in the request body.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[Choose a license - e.g., MIT, Apache 2.0]
