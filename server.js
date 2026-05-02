const express = require('express');
const YTDlpWrap = require('yt-dlp-wrap').default;
const cors = require('cors');
const path = require('path');

const app = express();

// Render-এ কাজ করার জন্য yt-dlp এর পাথ সেট করা
// (নিশ্চিত করুন আপনি Render settings-এ Build Command আপডেট করেছেন)
const ytDlpWrap = new YTDlpWrap('./yt-dlp');

app.use(cors());
app.use(express.json());

// ১. ভিডিও অ্যানালাইজ API
app.get('/api/analyze', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: 'URL দিন' });

    try {
        const metadata = await ytDlpWrap.getVideoInfo(videoURL);
        
        res.json({
            title: metadata.title || 'Social Video',
            thumbnail: metadata.thumbnail || '',
            duration: metadata.duration_string || 'N/A',
            url: videoURL,
            formats: [{ id: 'best', resolution: 'High Quality', ext: 'mp4' }]
        });
    } catch (error) {
        console.error("Analyze Error:", error);
        res.status(500).json({ error: 'ভিডিও পাওয়া যায়নি। লিঙ্কটি চেক করুন।' });
    }
});

// ২. ডাউনলোড API
app.get('/api/download', (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL missing');

    res.header('Content-Disposition', `attachment; filename="video.mp4"`);

    // '-f', 'b' ব্যবহার করা হয়েছে সহজ ডাউনলোডের জন্য
    const ytDlpProcess = ytDlpWrap.execStream([
        url,
        '-f', 'best', 
        '--no-check-certificates',
        '-o', '-'
    ]);

    ytDlpProcess.pipe(res);

    ytDlpProcess.on('error', (err) => {
        console.error("Download Error:", err);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`সার্ভার চালু হয়েছে: http://localhost:${PORT}`);
});
