const express = require('express');
const cors = require('cors');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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

app.post('/download', async (req, res) => {
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Update yt-dlp on server start
    updateYtDlp();
});
