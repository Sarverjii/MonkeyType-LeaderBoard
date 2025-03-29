// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./typingLeaderboard.db');

// Ensure the table exists
db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    year TEXT,
    wpm INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add a new score
function addScore(name, year, wpm) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO scores (name, year, wpm) VALUES (?, ?, ?)`, [name, year, wpm], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Get best scores by unique name-year pairs
function getBestScores() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT name, year, MAX(wpm) as wpm, id
       FROM scores
       GROUP BY name, year
       ORDER BY wpm DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// Get attempts by a specific user
function getAttemptsByUser(name, year) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT wpm, timestamp, id FROM scores WHERE name = ? AND year = ? ORDER BY wpm DESC`, [name, year], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Delete all scores by student name and year
function deleteScoresByStudent(name, year) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM scores WHERE name = ? AND year = ?`, [name, year], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Delete a score by ID
function deleteScore(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM scores WHERE id = ?`, id, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  addScore,
  getBestScores,
  getAttemptsByUser,
  deleteScoresByStudent,
  deleteScore,
};
