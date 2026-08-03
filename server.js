const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { handleMessage } = require('./messageHandler');

const app = express();
app.use(express.json());

// JSON endpoint for apps list
app.get('/apps', async (req, res) => {
    try {
        const files = await fs.readdir('./apps');
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        res.json(htmlFiles);
    } catch (err) {
        console.error('ERROR reading /apps:', err.message);
        res.status(500).json([]);
    }
});

// Serve flatchat app
app.get('/flatchat', (req, res) => {
    res.sendFile(path.join(__dirname, 'apps', 'flatchat.html'));
});

// Serve static files last
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
