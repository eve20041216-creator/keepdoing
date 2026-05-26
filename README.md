# KeepDoing - Personal Productivity & Task Management Application

A complete, production-ready personal productivity and task management application built with React, TypeScript, Express, and SQLite.

## Features

### ✨ Core Features

- **📋 Task Dashboard** - Display today's tasks with real-time completion tracking
- **📝 Plan Management** - Create and manage multiple projects/plans
- **⏱️ Task Scheduling** - Set task duration and optional due dates
- **🗓️ Workday/Rest Day System** - Different task plans for different day types
- **📅 Custom Calendar** - Override default workday/weekend settings
- **🍅 Pomodoro Timer** - Customizable focus, short break, and long break durations
- **📔 Daily Summary** - Journal entries with mood and energy tracking
- **📊 History Calendar** - View past summaries, completion rates, and statistics
- **💾 Data Persistence** - SQLite database with automatic data saving
- **🌓 Dark/Light Mode** - Full theme support
- **📈 Statistics** - Daily, weekly, and monthly completion rates with visual charts

## Project Structure

```
keepdoing/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── db.ts
│   │   ├── services/
│   │   │   ├── taskService.ts
│   │   │   ├── pomodoroService.ts
│   │   │   ├── summaryService.ts
│   │   │   └── settingsService.ts
│   │   ├── routes/
│   │   │   ├── taskRoutes.ts
│   │   │   ├── pomodoroRoutes.ts
│   │   │   ├── summaryRoutes.ts
│   │   │   └── settingsRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── PomodoroTimer.tsx
    │   ├── pages/
    │   │   ├── TaskDashboard.tsx
    │   │   ├── PomodoroPage.tsx
    │   │   └── HistoryPage.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── context/
    │   │   └── AppContext.tsx
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Database Schema

### 6 Core Tables

1. **plans** - Project/plan management
   - `id` (UUID, Primary Key)
   - `name` (String, unique)
   - `description` (String, optional)
   - `color` (String, optional)
   - `is_workday` (Boolean)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

2. **tasks** - Individual tasks
   - `id` (UUID, Primary Key)
   - `plan_id` (UUID, Foreign Key → plans.id)
   - `title` (String)
   - `description` (String, optional)
   - `duration_minutes` (Integer, optional)
   - `due_date` (Date, optional)
   - `completed` (Boolean)
   - `completed_at` (Timestamp, optional)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

3. **daily_summaries** - Daily journal entries
   - `id` (UUID, Primary Key)
   - `date` (Date, unique)
   - `content` (Text)
   - `mood` (String: 😞, 😕, 😐, 🙂, 😄)
   - `energy_level` (Integer: 1-10)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

4. **calendar_config** - Custom workday/rest day settings
   - `id` (UUID, Primary Key)
   - `date` (Date, unique)
   - `day_type` (String: 'workday' | 'rest_day')
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

5. **pomodoro_sessions** - Pomodoro timer tracking
   - `id` (UUID, Primary Key)
   - `task_id` (UUID, Foreign Key → tasks.id, optional)
   - `date` (Date)
   - `duration_minutes` (Integer)
   - `completed` (Boolean)
   - `started_at` (Timestamp, optional)
   - `ended_at` (Timestamp, optional)
   - `created_at` (Timestamp)

6. **settings** - Application configuration
   - `id` (UUID, Primary Key)
   - `focus_duration` (Integer: default 25)
   - `short_break_duration` (Integer: default 5)
   - `long_break_duration` (Integer: default 15)
   - `theme` (String: 'light' | 'dark')
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend app will run on `http://localhost:3000`

## API Endpoints

### Task & Plan Management

- `POST /api/plans` - Create new plan
- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get specific plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/plan/:planId` - Get tasks by plan
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/complete` - Mark task as complete
- `DELETE /api/tasks/:id` - Delete task

### Pomodoro

- `POST /api/pomodoro/sessions` - Create pomodoro session
- `GET /api/pomodoro/sessions` - Get all sessions
- `POST /api/pomodoro/sessions/:id/start` - Start session
- `POST /api/pomodoro/sessions/:id/complete` - Complete session
- `GET /api/pomodoro/stats/daily/:date` - Get daily statistics
- `GET /api/pomodoro/stats/weekly/:endDate` - Get weekly statistics
- `GET /api/pomodoro/stats/monthly/:year/:month` - Get monthly statistics

### Daily Summaries

- `POST /api/summaries` - Create or update daily summary
- `GET /api/summaries/:date` - Get summary for specific date
- `PUT /api/summaries/:date` - Update summary

### Settings & Calendar

- `POST /api/settings/calendar` - Set calendar configuration
- `GET /api/settings/calendar/:date` - Get calendar config for date
- `GET /api/settings/app-settings` - Get app settings
- `PUT /api/settings/app-settings` - Update app settings

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm preview
```

## Data Storage

All data is stored locally in SQLite:

**Windows:** `C:\Users\<YourUsername>\AppData\Local\KeepDoing\keepdoing.db`

Data persists across application restarts.

## Technologies Used

### Backend
- Express.js - Web framework
- SQLite3 - Local database
- TypeScript - Type-safe development
- UUID - Unique identifiers
- CORS - Cross-origin resource sharing

### Frontend
- React 18 - UI framework
- TypeScript - Type-safe development
- Tailwind CSS - Styling
- Vite - Build tool
- Axios - HTTP client
- Lucide Icons - Icon library
- Recharts - Data visualization
- React Context - State management

## Configuration

### Environment Variables

No environment variables required for local development. The application uses local storage by default.

## Troubleshooting

### Database Issues
If you encounter database issues, the application will automatically create and initialize the database on first run.

### Port Conflicts
- Backend default port: 5000
- Frontend default port: 3000

Change ports in `backend/src/index.ts` and `frontend/vite.config.ts` if needed.

### API Connection Issues
Ensure the backend server is running before starting the frontend. The frontend proxies API requests to `http://localhost:5000`.

## License

MIT

## Support

For issues or questions, please check the repository issues section.

---

**KeepDoing** - Stay productive, one task at a time! 🎯
