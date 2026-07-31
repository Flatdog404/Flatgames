const express = require('express')
const path = require('path')
const fs = require('fs').promises
const scanfs = require('fs')
const { handleMessage } = require('./messageHandler')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Serve static files (your HTML/JS)
app.use(express.static(path.join(__dirname)))

app.get('/api/messages', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'Data', 'messages.txt'), 'utf8')
    res.type('text/plain').send(data)
  } catch (err) {
    if (err.code === 'ENOENT') return res.type('text/plain').send('')
    console.error(err)
    res.status(500).send('Error reading messages')
  }
})

app.post('/api/message', async (req, res) => {
  try {
    const { name, text } = req.body
    if (!text) return res.status(400).json({ error: 'Missing text' })
    const display = name ? `${name}: ${text}` : text
    await handleMessage(display)
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to handle message', err)
    res.status(500).json({ error: 'Failed to save message' })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

scanfs.readdir('./Apps/', (err, files) => {
  if (err) return console.error('Error scanning files', err)

    const txtFiles = files.filter(file => {
      return path.extname(file).toLowerCase() === '.html'
    })

    console.log(txtFiles)
})
