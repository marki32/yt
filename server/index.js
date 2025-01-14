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

// Function to update yt-dlp
const updateYtDlp = () => {
    try {
        execSync('yt-dlp -U');
        return true;
    } catch (error) {
        console.error('Error updating yt-dlp:', error);
        return false;
    }
};

// Move all API routes under /api
app.post('/api/download', async (req, res) => {
    const { url, formatId } = req.body;
    if (!url || !formatId) {
        return res.status(400).json({ error: 'URL and format ID are required' });
    }

    // Update yt-dlp first
    updateYtDlp();

    const outputPath = path.join(TEMP_DIR, `${Date.now()}.mp4`);
    
    try {
        const args = [
            '-f', formatId,
            '-o', outputPath,
            '--no-playlist',
            '--force-ipv4',
            url
        ];

        console.log('Starting download with args:', args);
        const ytDlp = spawn('yt-dlp', args);

        let errorOutput = '';

        ytDlp.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`yt-dlp error: ${data}`);
        });

        ytDlp.stdout.on('data', (data) => {
            console.log(`yt-dlp output: ${data}`);
        });

        ytDlp.on('close', (code) => {
            if (code !== 0) {
                console.error('Download failed with code:', code);
                console.error('Error output:', errorOutput);
                return res.status(500).json({ 
                    error: 'Download failed', 
                    details: errorOutput,
                    code: code 
                });
            }

            if (!fs.existsSync(outputPath)) {
                return res.status(500).json({ 
                    error: 'Output file not found',
                    details: errorOutput
                });
            }

            const stat = fs.statSync(outputPath);
            res.writeHead(200, {
                'Content-Length': stat.size,
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename=${path.basename(outputPath)}`
            });

            const readStream = fs.createReadStream(outputPath);
            readStream.pipe(res);

            readStream.on('end', () => {
                fs.unlinkSync(outputPath);
            });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Update yt-dlp on server start
    updateYtDlp();
});
