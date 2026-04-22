# 🎯 Task Tracker with Reminders & Progress Reports

A full-stack task management application designed for students, especially those learning **Cybersecurity**. Track your daily tasks (workout, college, skill development), get desktop reminders, and receive a **weekly report with 0–100% adherence score**.

## ✨ Features

- ✅ **Add / Delete / Complete tasks** – Easy task management
- ⏰ **Desktop Reminders** – Automatic notifications when it's time for a task
- 📊 **Weekly Report** – Detailed report with:
  - Total tasks vs completed tasks
  - Category-wise breakdown (Cybersecurity, College, Workout, etc.)
  - Daily adherence percentage
  - Final verdict with improvement tips
- 🗓️ **Calendar Navigation** – View any day's schedule
- 💾 **Persistent Storage** – SQLite database saves all your data
- 📈 **Progress Tracking** – See exactly how much you followed (0-100%)

## 🛠️ Tech Stack

| Frontend | Backend | Database | Reminders |
|----------|---------|----------|-----------|
| HTML5 | Node.js | SQLite | node-cron |
| CSS3 | Express | - | Browser Notifications API |
| JavaScript (Vanilla) | - | - | - |

## 📁 Project Structure

task-tracker/
├── backend/
│ ├── server.js 
│ ├── package.json
│ └── database.sqlite
├── frontend/
│ ├── index.html 
│ ├── style.css 
│ └── script.js 
└── README.md 


## 🚀 How to Run Locally

### Prerequisites
- **Node.js** (v14 or higher) – [Download here](https://nodejs.org/)
- Git Bash / Terminal

### Step 1: Clone the repository
git clone https://github.com/Balamuralikrishna2004/task_tracker.git
cd task_tracker

step 2:Install backend dependencies
cd backend
npm install

Step 3: Start the backend server
node server.js

Step 4: Open the frontend
Open frontend/index.html in your browser

Or use Live Server in VS Code

Step 5: Start tracking tasks!
Add tasks with time, duration, and category

Mark them complete when done

Get desktop reminders automatically

Generate weekly reports to see your progress


📊 Report Example
After generating a weekly report, you'll see:

text
📅 2024-01-15 to 2024-01-21
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Completed: 18 / 24 tasks
📊 Overall adherence: 75%

📂 By Category:
🔒 Cybersecurity: 8/10 (80%)
💪 Workout: 3/5 (60%)
📚 College: 7/9 (78%)

📝 Final Verdict: Good job! A little more consistency will make you unstoppable.

🔔 Reminder System
Checks for pending tasks every 30 seconds

Shows desktop notification when it's time for a task

Works even when browser is minimized (with permission)

🛠️ Future Improvements
Email daily summaries

Export reports as PDF

Mobile push notifications

User authentication (multiple users)

Dark/Light theme toggle

Data export (CSV/JSON)

🤝 Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first.


📝 License
This project is open source and available under the MIT License.

👨‍💻 Author
Balamuralikrishna
GitHub: @Balamuralikrishna2004
