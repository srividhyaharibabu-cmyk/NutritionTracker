# Nutrition Tracker Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. MySQL Database Setup
1. Install MySQL Server
2. Create database:
```sql
CREATE DATABASE nutrition_tracker;
```

### 3. Environment Configuration
Update `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=nutrition_tracker
JWT_SECRET=your_secret_key
PORT=5000
```

### 4. Start Server
```bash
npm run dev
```

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/microsoft-login` - Microsoft OAuth login

## Database Schema

### Users Table
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- username (VARCHAR(255), UNIQUE, NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password (VARCHAR(255)) - hashed
- microsoft_id (VARCHAR(255)) - for Microsoft login
- created_at (TIMESTAMP)