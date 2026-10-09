const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Database Connection
connectDB();

// Middlewares (Yeh dono routes se PEHLE honi chahiye)
app.use(cors());
app.use(express.json()); 

// Import Routes
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');

// Mount Routes
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);

// Root Test Route
app.get('/', (req, res) => {
    res.send('School Fee & Finance API is Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});