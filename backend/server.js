const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  duration INTEGER DEFAULT 60,
  category TEXT DEFAULT 'General',
  completed BOOLEAN DEFAULT 0,
  completed_at TEXT,
  date TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS task_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  status TEXT,
  timestamp TEXT,
  FOREIGN KEY(task_id) REFERENCES tasks(id)
)`);

// API Routes

// Get today's tasks
app.get('/api/tasks/:date', (req, res) => {
  const date = req.params.date;
  db.all(`SELECT * FROM tasks WHERE date = ? ORDER BY scheduled_time`, [date], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Add task
app.post('/api/tasks', (req, res) => {
  const { name, scheduled_time, duration, category, date } = req.body;
  db.run(`INSERT INTO tasks (name, scheduled_time, duration, category, date) VALUES (?, ?, ?, ?, ?)`,
    [name, scheduled_time, duration, category, date],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID });
    }
  );
});

// Mark task complete
app.put('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  const completed_at = new Date().toISOString();
  db.run(`UPDATE tasks SET completed = 1, completed_at = ? WHERE id = ?`,
    [completed_at, id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        db.run(`INSERT INTO task_logs (task_id, status, timestamp) VALUES (?, ?, ?)`,
          [id, 'completed', completed_at]);
        res.json({ success: true });
      }
    }
  );
});

// Mark task incomplete
app.put('/api/tasks/:id/incomplete', (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE tasks SET completed = 0, completed_at = NULL WHERE id = ?`, [id], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true });
  });
});

// Get weekly report
app.get('/api/report/week/:startDate', (req, res) => {
  const startDate = req.params.startDate;
  db.all(`SELECT * FROM tasks WHERE date >= ? AND date <= date(?, '+6 days')`, [startDate, startDate], (err, tasks) => {
    if (err) res.status(500).json({ error: err.message });
    else {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed === 1).length;
      const percentage = total === 0 ? 0 : (completed / total) * 100;
      
      const byCategory = {};
      tasks.forEach(task => {
        if (!byCategory[task.category]) {
          byCategory[task.category] = { total: 0, completed: 0 };
        }
        byCategory[task.category].total++;
        if (task.completed) byCategory[task.category].completed++;
      });
      
      res.json({
        startDate,
        endDate: new Date(new Date(startDate).getTime() + 6 * 86400000).toISOString().split('T')[0],
        totalTasks: total,
        completedTasks: completed,
        percentage: Math.round(percentage),
        byCategory,
        dailyBreakdown: tasks.reduce((acc, task) => {
          if (!acc[task.date]) acc[task.date] = { total: 0, completed: 0 };
          acc[task.date].total++;
          if (task.completed) acc[task.date].completed++;
          return acc;
        }, {})
      });
    }
  });
});

// Reminder system (runs every minute)
cron.schedule('* * * * *', () => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const today = now.toISOString().split('T')[0];
  
  db.all(`SELECT * FROM tasks WHERE date = ? AND scheduled_time = ? AND completed = 0`, [today, currentTime], (err, tasks) => {
    if (err) console.error(err);
    tasks.forEach(task => {
      console.log(`🔔 REMINDER: ${task.name} at ${task.scheduled_time}`);
      // Here you can add: Email, Push notification, SMS, Desktop notification
    });
  });
});

// Email reminder setup (optional - uncomment and configure)
/*
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'your_email@gmail.com', pass: 'your_password' }
});

cron.schedule('0 8 * * *', () => {
  // Send daily summary email
});
*/

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));