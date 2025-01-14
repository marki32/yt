const express = require('express');
const cors = require('cors');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React/Vite app
app.use(express.static(path.join(__dirname, '../dist')));

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// Move all API routes under /api
app.post('/api/download', async (req, res) => {
    try {
        const { url, formatId } = req.body;
        if (!url || !formatId) {
            return res.status(400).json({ error: 'URL and format ID are required' });
        }

        const outputPath = path.join(TEMP_DIR, `${Date.now()}.mp4`);
        const command = `yt-dlp -f ${formatId} "${url}" -o "${outputPath}"`;

        try {
            execSync(command);
            
            if (fs.existsSync(outputPath)) {
                res.download(outputPath, (err) => {
                    if (err) {
                        console.error('Download error:', err);
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Download failed' });
                        }
                    }
                    // Clean up the file after download
                    fs.unlinkSync(outputPath);
                });
            } else {
                res.status(500).json({ error: 'Video download failed' });
            }
        } catch (error) {
            console.error('yt-dlp error:', error);
            res.status(500).json({ error: 'Failed to download video' });
        }
    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Handle CORS preflight
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
