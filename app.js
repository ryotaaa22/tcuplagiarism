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
  host: process.env.DB_HOST,  // Database host
  user: process.env.DB_USER,  // Database user
  password: process.env.DB_PASSWORD,  // Database password
  database: process.env.DB_NAME,  // Database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to check plagiarism
const checkPlagiarism = async (newContent) => {
  try {
    // Retrieve all stored content from the plagiarism checker database
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

    return { plagiarized: false };
  } catch (err) {
    throw new Error('Error while processing the plagiarism check: ' + err.message);
  }
};

// Function to insert post into both the publication and plagiarism checker databases
const insertPostIntoDatabases = async (newContent, title, section) => {
  try {
    // Insert into the publication site database
    await db.query('INSERT INTO posting (content, title, section) VALUES (?, ?, ?)', [newContent, title, section]);

    // Insert into the plagiarism checker database
    await db.query('INSERT INTO posting (content, title, section) VALUES (?, ?, ?)', [newContent, title, section]);

    return true; // Successfully inserted into both databases
  } catch (err) {
    throw new Error('Error while inserting the post: ' + err.message);
  }
};

// Plagiarism check API endpoint
app.post('/check-plagiarism', async (req, res) => {
  const { content, title, section } = req.body;

  // Validate input
  if (!content || !title || !section) {
    return res.status(400).json({ error: 'Content, title, and section are required' });
  }

  try {
    // First, check if the content is plagiarized
    const result = await checkPlagiarism(content);

    if (result.plagiarized) {
      // If plagiarized, return the original content
      return res.status(200).json({
        status: 'Plagiarism detected',
        original_content: result.originalContent,
      });
    }

    // If no plagiarism detected, insert the post into both databases
    await insertPostIntoDatabases(content, title, section);

    res.status(200).json({ status: 'No plagiarism detected' });
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
