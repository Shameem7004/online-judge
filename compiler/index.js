const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const codeRoutes = require('./routes/codeRoutes');

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// Routes
app.use('/compiler/api', codeRoutes);



// Default Route 
app.get('/', (req,res) => {
    res.send(`<h1>HomePage</h1>`)
});


// Server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Compiler service running on port ${PORT}`);
});