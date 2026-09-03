const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { handleMessage } = require('./messageHandler');

const app = express();
app.use(express.json());

const rootDirectory = __dirname;
const messagesPath = path.join(rootDirectory, 'Data', 'messages.txt');

// Chat API
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await fs.readFile(messagesPath, 'utf8');
        res.type('text/plain').send(messages);
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.type('text/plain').send('');
            return;
        }

        console.error('ERROR reading messages:', err.message);
        res.status(500).type('text/plain').send('Unable to load messages.');
    }
});

app.post('/api/message', async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

    if (!text) {
        res.status(400).json({ error: 'Message text is required.' });
        return;
    }

    try {
        await handleMessage(`${name || 'Anonymous'}: ${text}`);
        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('ERROR saving message:', err.message);
        res.status(500).json({ error: 'Unable to save message.' });
    }
});

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
const HOST = '0.0.0.0';
const interfaces = os.networkInterfaces();
const wifiInterface = Object.entries(interfaces).find(([name]) =>
    /wi-?fi|wlan|wireless/i.test(name) || /^en0$/i.test(name)
);
const allNetworkAddresses = Object.values(interfaces)
    .flat()
    .filter(address => address && address.family === 'IPv4' && !address.internal)
    .map(address => address.address);
const wifiAddress = wifiInterface?.[1]
    ?.find(address => address.family === 'IPv4' && !address.internal)?.address;
const networkAddress = wifiAddress || allNetworkAddresses[0];

async function getDirectoryStatus(directory, extension) {
    try {
        const files = await fs.readdir(path.join(rootDirectory, directory));
        const matchingFiles = extension
            ? files.filter(file => file.toLowerCase().endsWith(extension))
            : files;
        return { exists: true, count: matchingFiles.length };
    } catch {
        return { exists: false, count: 0 };
    }
}

async function getFileStatus(file) {
    try {
        await fs.access(path.join(rootDirectory, file));
        return true;
    } catch {
        return false;
    }
}

async function reportStartupStatus() {
    const checks = [
        ['flatchat.html', getFileStatus('flatchat.html')],
        ['apps-loader.js', getFileStatus('apps-loader.js')],
        ['Apps folder', getDirectoryStatus('Apps')],
        ['Themes folder', getDirectoryStatus('Themes')],
        ['Data folder', getDirectoryStatus('Data')]
    ];
    const results = await Promise.all(checks.map(async ([name, check]) => ({
        name,
        result: await check
    })));
    const passed = results.filter(({ result }) =>
        typeof result === 'boolean' ? result : result.exists
    ).length;
    const percentage = Math.round((passed / results.length) * 100);
    const status = percentage === 100 ? 'GOOD' : 'OK';

    console.log(`SERVER: ${status} (${percentage}% of checks passed)`);

    for (const { name, result } of results) {
        const passedCheck = typeof result === 'boolean' ? result : result.exists;
        if (!passedCheck) {
            console.error(`ERROR: Missing ${name}`);
        }
    }

    return percentage;
}

app.listen(PORT, HOST, async () => {
    await reportStartupStatus();
    console.log('');

    if (!networkAddress) {
        console.log(`Hosting check: NO NETWORK ADDRESS FOUND`);
        console.log(`Hosting locally on http://localhost:${PORT}`);
        return;
    }

    console.log(`Hosting: http://${networkAddress}:${PORT}`);
});
