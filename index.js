const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = [];

// Add a user to active users list
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

// Remove user when they disconnect
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

// Get user by userId
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

// Socket connection handling
io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle user joining
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    // Handle sending messages
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
            });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
