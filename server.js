const express = require('express');
const YTDlpWrap = require('yt-dlp-wrap').default;
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const ytDlpWrap = new YTDlpWrap();

// ১. ফায়ারবেস সেটআপ
try {
    const serviceAccount = require("./firebase-config.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://firebaseio.com"
    });
} catch (e) {
    console.log("Firebase config not found, moving on...");
}

app.use(cors());
app.use(express.json());
app.use(express.static('./')); // এটি আপনার index.html ফাইলকে সরাসরি লোড করবে

// ২. ভিডিও অ্যানালাইজ API
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
        res.status(500).json({ error: 'ভিডিও পাওয়া যায়নি।' });
    }
});

// ৩. ডাউনলোড API
app.get('/api/download', (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL missing');

    res.header('Content-Disposition', `attachment; filename="video.mp4"`);

    const ytDlpProcess = ytDlpWrap.execStream([
        url,
        '-f', 'best', 
        '--no-check-certificates',
        '-o', '-'
    ]);

    ytDlpProcess.pipe(res);

    ytDlpProcess.on('error', (err) => {
        console.error("Error:", err);
    });
});

// ৪. গুরুত্বপূর্ণ পরিবর্তন: Render-এর জন্য PORT সেটআপ
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`সার্ভার চালু হয়েছে: Port ${PORT}`);
});
