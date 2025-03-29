// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');



const app = express();


// Node.js server-side example
const dotenv = require('dotenv');
dotenv.config();
app.get('/api/env', (req, res) => {
  res.json({ password: process.env.PASSWORD });
});






app.use(bodyParser.json());
app.use(express.static('public'));

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const leaderboard = await db.getBestScores();
  res.json(leaderboard);
});

// Get attempts by a specific user
app.get('/api/attempts/:name/:year', async (req, res) => {
  const { name, year } = req.params;
  const attempts = await db.getAttemptsByUser(name, year);
  attempts.sort((a, b) => b.wpm - a.wpm);
  res.json(attempts);
});

// Add a new entry
app.post('/api/leaderboard', async (req, res) => {
  const { name, year, wpm } = req.body;
  await db.addScore(name, year, wpm);
  const leaderboard = await db.getBestScores();
  res.json(leaderboard);
});

// Delete all entries by student name and year
app.delete('/api/leaderboard/:name/:year', async (req, res) => {
  const { name, year } = req.params;
  await db.deleteScoresByStudent(name, year);
  const leaderboard = await db.getBestScores();
  res.json(leaderboard);
});

// Delete a single attempt by ID
app.delete('/api/attempts/:id', async (req, res) => {
  const { id } = req.params;
  await db.deleteScore(id);
  res.json({ deleted: true });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
