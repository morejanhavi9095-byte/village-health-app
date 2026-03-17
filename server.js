require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 1. Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'village-health-patients',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// 2. MySQL Setup
let pool;
const initDB = async () => {
    try {
        console.log('Attempting to connect to MySQL...');
        // First connect to MySQL without selecting a database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS
        });

        console.log('Main MySQL connection established. Creating database if needed...');
        // Create the database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'village_health'}\``);
        await connection.end();

        // Now create the pool with the database selected
        pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS,
            database: process.env.DB_NAME || 'village_health',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const poolConn = await pool.getConnection();
        await poolConn.query(`CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            age INT,
            weight DECIMAL(5,2),
            photo_path TEXT,
            health_issues TEXT
        )`);
        poolConn.release();
        console.log('Connected to MySQL successfully and table is ready!');
    } catch (err) {
        console.error('MySQL Connection Error:', err);
    }
};
initDB();

// Disease Data
const diseases = [
    { name_en: "Fever", name_mr: "ताप", symptoms: "High body temperature...", precautions: "Drink water...", care: "See doctor..." },
    { name_en: "Cold", name_mr: "सर्दी", symptoms: "Runny nose...", precautions: "Keep warm...", care: "Warm salt water..." },
    { name_en: "Cough", name_mr: "खोकला", symptoms: "Dry or wet cough...", precautions: "Avoid oily foods...", care: "Honey and ginger..." },
    { name_en: "Diabetes", name_mr: "मधुमेह", symptoms: "Excessive thirst...", precautions: "Low sugar diet...", care: "Medication..." },
    { name_en: "Malaria", name_mr: "मलेरिया", symptoms: "High fever...", precautions: "Use nets...", care: "See doctor..." },
    { name_en: "Dengue", name_mr: "डेंग्यू", symptoms: "Severe headache...", precautions: "Repellents...", care: "Stay hydrated..." }
];

// Routes
app.get('/api/diseases/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const result = diseases.find(d => d.name_en.toLowerCase().includes(query) || d.name_mr.includes(query));
    res.json(result || null);
});

app.post('/api/submit', upload.single('photo'), async (req, res) => {
    try {
        const { name, age, weight, healthIssues } = req.body;
        const photoPath = req.file ? req.file.path : null; 

        console.log('Received form submission for:', name);

        if (!pool) {
            throw new Error('Database not connected yet.');
        }

        // Check for duplicate
        const [rows] = await pool.execute('SELECT * FROM patients WHERE name = ? AND age = ?', [name, age]);
        if (rows.length > 0) {
            return res.json({ status: 'duplicate', message: 'Duplicate entry. Already submitted!' });
        }

        // Insert into MySQL
        await pool.execute('INSERT INTO patients (name, age, weight, photo_path, health_issues) VALUES (?, ?, ?, ?, ?)', 
            [name, age, weight, photoPath, healthIssues]);
        
        console.log('Submission successful for:', name);
        res.json({ status: 'success', message: 'Health details submitted successfully!' });
    } catch (err) {
        console.error('Form Submission Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin Protection
const ADMIN_PASSWORD = 'admin123';
const checkAuth = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (password === ADMIN_PASSWORD) next();
    else res.status(401).json({ error: 'Unauthorized' });
};

app.get('/api/patients', checkAuth, async (req, res) => {
    try {
        if (!pool) throw new Error('Database not connected.');
        const [rows] = await pool.query('SELECT * FROM patients');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/patients/:id', checkAuth, async (req, res) => {
    try {
        if (!pool) throw new Error('Database not connected.');
        await pool.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Global JSON Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: err.message || 'An internal server error occurred' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
