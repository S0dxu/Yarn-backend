const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');

const users = []
const KEY = process.env.key;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    }
});

const hostname = '0.0.0.0';
const port = 3000;

app.use(cors({
    origin: '*',
}));
app.use(express.json());

io.on('connection', (socket) => {
    /* console.log('connected: ' + socket.id); */

    socket.on('joinRoom', (username) => {
        if (users.includes(username)) {
            socket.emit('errorMessage', 'Username already taken!');
            return;
        } else {
            const token = jwt.sign({ username }, KEY, { expiresIn: '1h' });
            socket.emit('success', token);
            users.push(username);
            /* console.log(users); */
        }
    });

    socket.on('sendMessage', (message, token, color) => {
        const timestamp = new Date().toISOString();
        
        try {
            const decoded = jwt.verify(token, KEY);
            io.emit('broadcastMessage', message, decoded.username, color, timestamp);
        } catch (err) {
            socket.emit('errorMessage', 'Invalid token! Authentication failed.');
            socket.disconnect();
        }
    });
    

    socket.on('userGone', (username) => {
        /* console.log('userGone: ' + username); */
        users.splice(users.indexOf(username), 1);
        /* console.log(users);
        console.log("disconnected") */
    });

    socket.on('disconnect', () => {
        /* console.log('disconnected: ' + socket.id); */
    });
    /* console.log(users) */
});

server.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}/`);
});
