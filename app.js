const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const stringSimilarity = require('string-similarity');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Set up MySQL connection pool using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST,  // Database host, e.g., 'localhost' for local or remote DB URL for production
  user: process.env.DB_USER,  // Database user
  password: process.env.DB_PASSWORD,  // Database password
  database: process.env.DB_NAME,  // Database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to check plagiarism
const checkPlagiarism = async (newContent, section) => {
  try {
    // Retrieve all stored content from the 'posting' table
    const [results] = await db.query('SELECT content FROM posting');

    // Compare each stored content with the incoming content
    for (let row of results) {
      const storedText = row.content;
      const similarity = stringSimilarity.compareTwoStrings(newContent, storedText);

      // Mark as plagiarized if similarity exceeds 80%
      if (similarity > 0.8) {
        return { plagiarized: true, originalContent: storedText };
      }
    }

    // If no plagiarism is detected, insert new content into the database
    await db.query('INSERT INTO posting (content, section) VALUES (?, ?)', [newContent, section]);
    return { plagiarized: false };
  } catch (err) {
    throw new Error('Error while processing the plagiarism check: ' + err.message);
  }
};

// Plagiarism check API endpoint
app.post('/check-plagiarism', async (req, res) => {
  const { content, section } = req.body;

  // Validate input
  if (!content || !section) {
    return res.status(400).json({ error: 'Content and section are required' });
  }

  try {
    const result = await checkPlagiarism(content, section);

    if (result.plagiarized) {
      res.status(200).json({
        status: 'Plagiarism detected',
        original_content: result.originalContent,
      });
    } else {
      res.status(200).json({ status: 'No plagiarism detected' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Root API endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Plagiarism Checker API!');
});

// Start the server
app.listen(port, () => {
  console.log(`Plagiarism checker API running on http://localhost:${port}`);
});
