import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

let io;
let activeUsersCount = 0;
const onlinePresenceMap = {}; // Tracks { userId: true } dynamically

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    activeUsersCount++;
    io.emit('active_users_update', activeUsersCount);

    socket.on('register_session', (userId) => {
        onlinePresenceMap[userId] = true;
        socket.userId = userId; // Secure tag
        io.to('admin_room').emit('presence_map_update', onlinePresenceMap);
    });

    socket.on('authenticate_admin', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.role === 'admin') {
          socket.join('admin_room');
          socket.emit('admin_authenticated', true);
          socket.emit('presence_map_update', onlinePresenceMap); // Initial Roster Push
        }
      } catch (err) { }
    });

    socket.on('disconnect', () => {
      activeUsersCount--;
      io.emit('active_users_update', activeUsersCount);
      if (socket.userId) {
          delete onlinePresenceMap[socket.userId];
          io.to('admin_room').emit('presence_map_update', onlinePresenceMap);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Function to broadcast purchase to all clients (for live popup)
export const broadcastNewPurchase = (orderData) => {
  if (!io) return;
  io.emit('LIVE_PURCHASE', orderData);
};
