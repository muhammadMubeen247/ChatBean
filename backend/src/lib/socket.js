import {Server} from 'socket.io'
import http from 'http'
import express from 'express'
import { defaultMaxListeners } from 'events';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true
    }
});


const userSocketMap = {}

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

io.on("connection", (socket) => {
    console.log('A User Connected', socket.id);
    
    const userId = socket.handshake.auth?.userId;
    console.log('Auth data received:', socket.handshake.auth);
    console.log('UserId from auth:', userId); // Add this log
    
    if (!userId) {
        console.log('No userId in auth, disconnecting');
        socket.disconnect();
        return;
    }

    // Store user connection
    userSocketMap[userId] = socket.id;
    console.log('Updated userSocketMap:', userSocketMap);

    // Emit updated online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (userId) {
            delete userSocketMap[userId];
            console.log('Updated userSocketMap:', userSocketMap);
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export {io,app,server}