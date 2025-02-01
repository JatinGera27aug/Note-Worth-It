const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config()

app.use(express.json({ limit: "10mb" })); 

app.set(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
app.use((err, req, res, next) => {
    console.error(err.stack); // Log full error stack (safe in dev)
    res.status(500).json({
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  });
const connectDB = require('./config/dbMongo.js');  // provide db url in .env file
connectDB();

const sampleRoutes = require('./routes/sampleRoutes.js')
const notesRoutes = require('./routes/notesRoutes.js')
const questionRoutes = require('./routes/questionRoutes.js')
const summaryRoutes = require('./routes/summaryRoutes.js')
const problemRoutes = require('./routes/problemsRoutes.js')

const PORT = 8000 || process.env.PORT;

app.get('/', (req, res) => res.send('HELLO WORLD'));

app.use('/api',sampleRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/problems', problemRoutes);

app.listen(PORT, () => {
    console.log("Server is running at http://localhost:8000");
});