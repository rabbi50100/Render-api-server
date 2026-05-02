const express = require('express');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
// ... অন্যান্য require ...

const app = express();
const ytDlpPath = './yt-dlp';
const ytDlpWrap = new YTDlpWrap(ytDlpPath);

// সার্ভার চালু হওয়ার সময় yt-dlp ডাউনলোড করবে যদি না থাকে
if (!fs.existsSync(ytDlpPath)) {
    YTDlpWrap.downloadFromGithub(ytDlpPath).then(() => {
        console.log('yt-dlp downloaded successfully');
    }).catch(err => console.error('Error downloading yt-dlp:', err));
}
