const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const users = []

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

const hostname = '127.0.0.1';
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
            socket.emit('success');
            users.push(username);
            /* console.log(users); */
        }
    });

    socket.on('sendMessage', (message, username, color) => {
        const timestamp = new Date().toISOString();
        io.emit('broadcastMessage', message, username, color, timestamp);
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

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
