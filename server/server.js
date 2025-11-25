import express from 'express'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nutrition_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Initialize database
const initDB = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        microsoft_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Database initialized')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    )
    
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const user = rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    )
    
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Microsoft login endpoint
app.post('/api/microsoft-login', async (req, res) => {
  try {
    const { email, name, microsoftId } = req.body
    
    let [rows] = await db.execute(
      'SELECT * FROM users WHERE microsoft_id = ? OR email = ?',
      [microsoftId, email]
    )
    
    let user
    if (rows.length === 0) {
      // Create new user
      await db.execute(
        'INSERT INTO users (username, email, microsoft_id) VALUES (?, ?, ?)',
        [name, email, microsoftId]
      )
      
      [rows] = await db.execute(
        'SELECT * FROM users WHERE microsoft_id = ?',
        [microsoftId]
      )
    }
    
    user = rows[0]
    
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    )
    
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

initDB()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})