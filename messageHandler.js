const fsPromises = require('fs').promises;
const path = require('path');

const MESSAGES_PATH = path.join(__dirname, 'Data', 'messages.txt');

async function handleMessage(message) {
  try {
    await fsPromises.mkdir(path.dirname(MESSAGES_PATH), { recursive: true });
    let data = '';
    try {
      data = await fsPromises.readFile(MESSAGES_PATH, 'utf8');
      console.log('Original content read.');
    } catch (err) {
      if (err.code === 'ENOENT') {
        data = '';
        console.log('Messages file not found — creating new one.');
      } else {
        throw err;
      }
    }

    const timestamp = new Date().toISOString();
    const newData = data + (data ? '\n' : '') + `[${timestamp}] ${message}`;
    await fsPromises.writeFile(MESSAGES_PATH, newData, 'utf8');
    console.log('Message appended to file.');
  } catch (err) {
    console.error('Error writing message:', err);
    throw err;
  }
}

module.exports = { handleMessage };
