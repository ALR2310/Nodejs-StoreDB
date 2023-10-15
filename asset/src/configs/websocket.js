const WebSocket = require('ws');

// Khởi tạo server WebSocket
const wss = new WebSocket.Server({ port: process.env.WS_PORT });

module.exports = wss;