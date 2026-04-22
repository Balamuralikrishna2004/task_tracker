const API_URL = 'http://localhost:3000/api';

let reminderInterval = null;
let reminderToggle = true;

// Get today's date in YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Load tasks for a specific date
async function loadTasks(date) {
    try {
        const response = await fetch(`${API_URL}/tasks/${date}`);
        const tasks = await response.json();
        displayTasks(tasks, date);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Display tasks in the UI
function displayTasks(tasks, date) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align:center; opacity:0.7;">✨ No tasks for this day. Add some above!</p>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'task-complete' : ''}" data-id="${task.id}">
            <div class="task-info">
                <div class="task-name">${escapeHtml(task.name)}</div>
                <div class="task-time">⏰ ${task.scheduled_time} (${task.duration} min)</div>
                <div class="task-category">${task.category}</div>
            </div>
            <div>
                ${!task.completed ? 
                    `<button class="complete-btn" onclick="completeTask(${task.id})">✓ Complete</button>` : 
                    `<button class="complete-btn" onclick="uncompleteTask(${task.id})">↺ Undo</button>`
                }
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

// Add a new task
async function addTask() {
    const name = document.getElementById('taskName').value;
    const scheduled_time = document.getElementById('taskTime').value;
    const duration = document.getElementById('taskDuration').value;
    const category = document.getElementById('taskCategory').value;
    const date = document.getElementById('selectedDate').value;
    
    if (!name) {
        alert('Please enter a task name');
        return;
    }
    
    try {
        await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, scheduled_time, duration: parseInt(duration), category, date })
        });
        
        // Clear form
        document.getElementById('taskName').value = '';
        document.getElementById('taskDuration').value = '90';
        
        // Reload tasks
        loadTasks(date);
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// Mark task as complete
async function completeTask(id) {
    const date = document.getElementById('selectedDate').value;
    try {
        await fetch(`${API_URL}/tasks/${id}/complete`, { method: 'PUT' });
        loadTasks(date);
    } catch (error) {
        console.error('Error completing task:', error);
    }
}

// Mark task as incomplete
async function uncompleteTask(id) {
    const date = document.getElementById('selectedDate').value;
    try {
        await fetch(`${API_URL}/tasks/${id}/incomplete`, { method: 'PUT' });
        loadTasks(date);
    } catch (error) {
        console.error('Error uncompleting task:', error);
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const date = document.getElementById('selectedDate').value;
    try {
        await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
        loadTasks(date);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Generate weekly report
async function generateReport() {
    const selectedDate = document.getElementById('selectedDate').value;
    // Get Monday of current week
    const date = new Date(selectedDate);
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    const startDate = monday.toISOString().split('T')[0];
    
    try {
        const response = await fetch(`${API_URL}/report/week/${startDate}`);
        const report = await response.json();
        
        const reportDiv = document.getElementById('reportResult');
        reportDiv.innerHTML = `
            <h3>📅 ${report.startDate} to ${report.endDate}</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${report.percentage}%">
                    ${report.percentage}%
                </div>
            </div>
            <p>✅ Completed: ${report.completedTasks} / ${report.totalTasks} tasks</p>
            <p>📊 Overall adherence: <strong>${report.percentage}%</strong></p>
            
            <h4 style="margin-top: 20px;">📂 By Category:</h4>
            ${Object.entries(report.byCategory).map(([cat, data]) => `
                <p>${cat}: ${data.completed}/${data.total} (${Math.round((data.completed/data.total)*100)}%)</p>
                <div class="progress-bar" style="height: 10px;">
                    <div class="progress-fill" style="width: ${(data.completed/data.total)*100}%; height: 10px;"></div>
                </div>
            `).join('')}
            
            <h4 style="margin-top: 20px;">📆 Daily Breakdown:</h4>
            ${Object.entries(report.dailyBreakdown).map(([date, data]) => `
                <p>${date}: ${data.completed}/${data.total} tasks (${Math.round((data.completed/data.total)*100)}%)</p>
            `).join('')}
            
            <div style="margin-top: 20px; padding: 15px; background: ${report.percentage >= 80 ? '#00ff8822' : report.percentage >= 60 ? '#ffaa0022' : '#ff444422'}; border-radius: 10px;">
                <strong>📝 Final Verdict:</strong><br>
                ${report.percentage >= 80 ? '🎉 Excellent! You\'re crushing your cybersecurity goals!' :
                  report.percentage >= 60 ? '👍 Good job! A little more consistency will make you unstoppable.' :
                  report.percentage >= 40 ? '⚠️ Room for improvement. Start with 3 non-negotiable tasks daily.' :
                  '🔴 Time to reset! Delete old tasks and recommit to 2-3 small wins each day.'}
            </div>
        `;
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Desktop reminder system
function startReminderChecker() {
    if (reminderInterval) clearInterval(reminderInterval);
    
    reminderInterval = setInterval(async () => {
        if (!reminderToggle) return;
        
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const today = now.toISOString().split('T')[0];
        
        try {
            const response = await fetch(`${API_URL}/tasks/${today}`);
            const tasks = await response.json();
            
            const upcomingTasks = tasks.filter(task => 
                !task.completed && task.scheduled_time === currentTime
            );
            
            for (const task of upcomingTasks) {
                // Desktop notification
                if (Notification.permission === 'granted') {
                    new Notification('🔔 Task Reminder', {
                        body: `Time for: ${task.name} (${task.category})`,
                        icon: 'https://img.icons8.com/color/48/cyber-security.png'
                    });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
                
                // Console reminder
                console.log(`🔔 REMINDER: ${task.name} at ${task.scheduled_time}`);
                
                // Optional: Play sound
                // new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3').play();
            }
        } catch (error) {
            console.error('Reminder error:', error);
        }
    }, 30000); // Check every 30 seconds
}

// Helper function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('generateReportBtn').addEventListener('click', generateReport);
document.getElementById('reminderToggle').addEventListener('change', (e) => {
    reminderToggle = e.target.checked;
});

// Date navigation
const dateInput = document.getElementById('selectedDate');
dateInput.value = getTodayDate();

document.getElementById('prevDayBtn').addEventListener('click', () => {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() - 1);
    dateInput.value = date.toISOString().split('T')[0];
    loadTasks(dateInput.value);
});

document.getElementById('nextDayBtn').addEventListener('click', () => {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() + 1);
    dateInput.value = date.toISOString().split('T')[0];
    loadTasks(dateInput.value);
});

dateInput.addEventListener('change', () => {
    loadTasks(dateInput.value);
});

// Initialize
loadTasks(getTodayDate());
startReminderChecker();

// Request notification permission on load
if (Notification.permission === 'default') {
    Notification.requestPermission();
}