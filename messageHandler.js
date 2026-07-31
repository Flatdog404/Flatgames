const fs = require('fs')
const fsPromises = require('fs').promises

const MESSAGES_PATH = 'Data/messages.txt'

async function handleMessage(message) {
  try {
    let data = ''
    try {
      data = await fsPromises.readFile(MESSAGES_PATH, 'utf8')
      console.log('Original content read.')
    } catch (err) {
      if (err.code === 'ENOENT') {
        data = ''
        console.log('Messages file not found — creating new one.')
      } else {
        throw err
      }
    }

    const timestamp = new Date().toISOString()
    const newData = data + (data ? '\n' : '') + `[${timestamp}] ${message}`
    await fsPromises.writeFile(MESSAGES_PATH, newData, 'utf8')
    console.log('Message appended to file.')
  } catch (err) {
    console.error('Error writing message:', err)
    throw err
  }
}

module.exports = { handleMessage }