// server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const port = 3001; // or any other port

// Create a proxy route for Pinata API. Injects API keys from env.
// Supports both pinFileToIPFS and pinJSONToIPFS depending on path.
app.use('/pinata', proxy('https://api.pinata.cloud', {
  proxyReqPathResolver: function (req) {
    // Forward the entire path after /pinata, e.g. /pinata/pinning/pinJSONToIPFS
    return req.originalUrl.replace('/pinata', '');
  },
  proxyReqOptDecorator: function (proxyReqOpts) {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    const apiKey = process.env.REACT_APP_PINATA_API_KEY || '';
    const secret = process.env.REACT_APP_PINATA_SECRET_KEY || '';
    if (!apiKey || !secret) {
      console.warn('[Pinata Proxy] Missing REACT_APP_PINATA_API_KEY or REACT_APP_PINATA_SECRET_KEY in .env');
    }
    proxyReqOpts.headers['pinata_api_key'] = apiKey;
    proxyReqOpts.headers['pinata_secret_api_key'] = secret;
    return proxyReqOpts;
  }
}));

// Start the server
app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`);
});