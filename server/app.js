const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config()

app.use(express.json({ limit: "10mb" })); 

app.set(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
const connectDB = require('./config/dbMongo.js');  // provide db url in .env file
connectDB();

const sampleRoutes = require('./routes/sampleRoutes.js')
const notesRoutes = require('./routes/notesRoutes.js')

const PORT = 8000 || process.env.PORT;

app.get('/', (req, res) => res.send('HELLO WORLD'));

app.use('/api',sampleRoutes);
app.use('/api/notes', notesRoutes);

app.listen(PORT, () => {
    console.log("Server is running at http://localhost:8000");
});