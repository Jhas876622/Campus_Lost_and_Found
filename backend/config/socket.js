const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ].filter(Boolean);

  io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return next(new Error('Authentication error: Invalid token'));
        }
        // Attach user ID to the socket connection
        socket.userId = decoded.id;
        next();
      });
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: User ID ${socket.userId}`);
    
    // Join a personal room named using the user ID
    // This allows emitting events straight to user IDs: io.to(userId).emit(...)
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ID ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized! Call initSocket first.');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
