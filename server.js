// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store room information
const rooms = new Map();

// Handle socket connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join room
    socket.on('join-room', (roomCode) => {
        const room = roomCode.toString();
        
        // Check if room exists
        if (!rooms.has(room)) {
            rooms.set(room, {
                users: [{ id: socket.id, number: 1 }],
                lastActivity: Date.now()
            });
            socket.join(room);
            socket.emit('joined', { 
                room: room, 
                userNumber: 1,
                userCount: 1
            });
        } else {
            const roomData = rooms.get(room);
            
            // Find next available user number
            let nextNumber = 1;
            while (roomData.users.some(user => user.number === nextNumber)) {
                nextNumber++;
            }
            
            // Add user to room
            roomData.users.push({ id: socket.id, number: nextNumber });
            roomData.lastActivity = Date.now();
            socket.join(room);
            socket.emit('joined', { 
                room: room, 
                userNumber: nextNumber,
                userCount: roomData.users.length
            });
            
            // Notify other users in the room
            socket.to(room).emit('user-joined', {
                userNumber: nextNumber,
                userCount: roomData.users.length
            });
        }
    });
    
    // Handle messages
    socket.on('message', (data) => {
        const { room, message, userNumber } = data;
        
        if (rooms.has(room) && rooms.get(room).users.some(user => user.id === socket.id)) {
            // Update activity timestamp
            rooms.get(room).lastActivity = Date.now();
            
            // Broadcast message to room (excluding sender)
            socket.to(room).emit('message', {
                message: message,
                timestamp: new Date(),
                userNumber: userNumber
            });
        }
    });
    
    // Handle typing
    socket.on('typing', (data) => {
        const { room, userNumber } = data;
        if (rooms.has(room) && rooms.get(room).users.some(user => user.id === socket.id)) {
            socket.to(room).emit('typing', { userNumber: userNumber });
        }
    });
    
    // Handle stop typing
    socket.on('stop-typing', (room) => {
        if (rooms.has(room) && rooms.get(room).users.some(user => user.id === socket.id)) {
            socket.to(room).emit('stop-typing');
        }
    });
    
    // Handle leaving room
    socket.on('leave-room', (room) => {
        leaveRoom(socket, room);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from all rooms
        for (const [roomCode, roomData] of rooms.entries()) {
            const userIndex = roomData.users.findIndex(user => user.id === socket.id);
            if (userIndex !== -1) {
                const userNumber = roomData.users[userIndex].number;
                roomData.users.splice(userIndex, 1);
                
                // Notify remaining users
                if (roomData.users.length > 0) {
                    socket.to(roomCode).emit('user-left', {
                        userNumber: userNumber,
                        userCount: roomData.users.length
                    });
                }
                
                // Delete room if empty
                if (roomData.users.length === 0) {
                    rooms.delete(roomCode);
                }
                break;
            }
        }
    });
});

// Room expiration check
setInterval(() => {
    const now = Date.now();
    for (const [roomCode, roomData] of rooms.entries()) {
        // If room has been inactive for 10 minutes
        if (now - roomData.lastActivity > 10 * 60 * 1000) {
            // Notify users in room
            io.to(roomCode).emit('room-expired');
            
            // Disconnect all users in the room
            for (const user of roomData.users) {
                const userSocket = io.sockets.sockets.get(user.id);
                if (userSocket) {
                    userSocket.leave(roomCode);
                }
            }
            
            // Clean up room
            rooms.delete(roomCode);
        }
    }
}, 60 * 1000); // Check every minute

// Helper function to handle leaving a room
function leaveRoom(socket, room) {
    if (rooms.has(room)) {
        const roomData = rooms.get(room);
        const userIndex = roomData.users.findIndex(user => user.id === socket.id);
        
        if (userIndex !== -1) {
            const userNumber = roomData.users[userIndex].number;
            roomData.users.splice(userIndex, 1);
            
            // Notify remaining users
            if (roomData.users.length > 0) {
                socket.to(room).emit('user-left', {
                    userNumber: userNumber,
                    userCount: roomData.users.length
                });
            }
            
            // Leave socket room
            socket.leave(room);
            
            // Delete room if empty
            if (roomData.users.length === 0) {
                rooms.delete(room);
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});