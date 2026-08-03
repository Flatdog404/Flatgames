const express = require('express');
const path = require('path');
const fs = require('fs').promises; // removed the weird fs double import thing
const { handleMessage } = require('./messageHandler');


// Create the Express app - minor vibecoding here
const app = express();
app.use(express.json());

// Serve flatchat app
app.get('/flatchat', (req, res) => {
    res.sendFile(path.join(__dirname, 'flatchat.html'));
});

// Serve static files (your HTML/JS)
app.use(express.static(path.join(__dirname)));

// serve index.html
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});


// API routes
app.get('/api/messages', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'Data', 'messages.txt'), 'utf8');
        res.type('text/plain').send(data);
    } catch (err) {
        if (err.code === 'ENOENT') return res.type('text/plain').send('');
        console.error(err);
        res.status(500).send('Error reading messages');
    }
});


app.post('/api/message', async (req, res) => {
    try {
        const { name, text } = req.body;
        if (!text) return res.status(400).json({ error: 'Missing text' });
        
        const display = name ? `${name}: ${text}` : text;
        await handleMessage(display);
        res.json({ ok: true });
    } catch (err) {
        console.error('Failed to handle message', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
});


// improved
app.get('/apps', async (req, res) => {
    try {
        const files = await fs.readdir('./Apps'); // Case-sensitive!
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        res.json(htmlFiles);
    } catch (err) {
        console.error('ERROR reading /apps:', err.message);
        res.status(500).json([]);
    }
});
