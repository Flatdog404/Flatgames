const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { handleMessage } = require('./messageHandler');

const app = express();
app.use(express.json());

const rootDirectory = __dirname;

// JSON endpoint for apps list
app.get('/apps', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(rootDirectory, 'Apps'));
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        res.json(htmlFiles);
    } catch (err) {
        console.error('ERROR reading /apps:', err.message);
        res.status(500).json([]);
    }
});

// JSON endpoint for themes discovered in the Themes folder
app.get('/themes', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(rootDirectory, 'Themes'));
        const cssFiles = files
            .filter(file => file.toLowerCase().endsWith('.css'))
            .map(file => file.slice(0, -4));
        res.json(cssFiles);
    } catch (err) {
        console.error('ERROR reading /themes:', err.message);
        res.status(500).json([]);
    }
});

// Serve flatchat app
app.get('/flatchat', (req, res) => {
    res.sendFile(path.join(rootDirectory, 'flatchat.html'));
});

// Serve static files last
app.use('/apps', express.static(path.join(rootDirectory, 'Apps')));
app.use('/themes', express.static(path.join(rootDirectory, 'Themes')));
app.use(express.static(rootDirectory));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
