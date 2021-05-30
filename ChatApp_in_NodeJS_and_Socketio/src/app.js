const path= require('path');
// Need to use http explicitely because a socket function takes server as a argument
const http = require('http');
const express = require('express');
const Filter = require("bad-words");
const socketio = require('socket.io')
const { generateMessage } = require("./utils/generateMessage");
const { addUser, removeUser, getUsers, getUsersInRoom } = require("./utils/users")

// Calling express function, Creating a server manually by using http, Calling socket function
const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public') 

// Setting up static content for express 
app.use(express.static(publicDirectoryPath))

// Listening event 'connection' using socket
io.on('connection', (socket)=>{
  console.log("New WebSocket connection ");
  // ********Emit a message from server to client. This is used when we don't work with rooms.
  // socket.emit("message", generateMessage("Welcome to chat app"));
  // ********Emit a message from server to client (Note: send message to every connection except one user who recently newly joined.). This is used when we don't work with rooms.
  // socket.broadcast.emit("message", generateMessage("New user joined !"));

  // Listening event "join" from client and emit event
  socket.on("join", ({ username, room }, callback) => {
    // Adding a new user in a room with username
    const { error, user } = addUser({ id: socket.id, username, room })
    if(error) {
      return callback(error)
    }

    // socket.join(room) method allow us to join a "room" with a name of room
    socket.join(user.room);

    // NOTE: In socket room , to emit events in room we have two methods :
    //  (1) io.to.emit => It emits a event to everybody in a specific room. Like sending a messages to all users avalaible in room
    //  (2) socket.broadcast.to.emit => It emits a message to every connection in a room except one user who recently newly joined.
    socket.emit("message", generateMessage('Admin', "Welcome to chat app"));
    socket.broadcast.to(user.room).emit("message", generateMessage('Admin', `${user.username} has joined !`));

    io.to(user.room).emit('roomData', {
      roomName: user.room,
      allUsersInRoom: getUsersInRoom(user.room)
    })

    callback()
  });

  // For acknowledgement purpose, we use callback here
  socket.on("sendMessage", (sendedMessage, callback) => {
    const filter = new Filter();
    // Getting a user from socket and send his/her message to a specific room
    const user = getUsers(socket.id);

    if (filter.isProfane(sendedMessage)) {
      return callback("Message is inconvenient, It can't be delievered !");
    }

    // Emit a message from server to client (Note: we write "io.emit" because we need to notify every connection, If we want to notify a single connection use "socket.emit".)
    // io.emit("message", generateMessage(sendedMessage));

    if(user){
      io.to(user.room).emit("message", generateMessage(user.username ,sendedMessage));
      callback();
    }
  });

  // Listen event "shareLocation" from client and emit event "locationMessage" to client
  socket.on("shareLocation", (sharedLocationURL, callback) => {
    // Getting a user from socket and send his/her message to a specific room
    const user = getUsers(socket.id);
    // io.emit("locationMessage", generateMessage(sharedLocationURL));
    if (user) {
      io.to(user.room).emit("locationMessage", generateMessage(user.username ,sharedLocationURL));
      callback();
    }
    callback();
  });

  // Note: 'connection' and 'disconnect' are the inbuilt events of socket. During 'disconnect' event we didn't got message in callback param because the connection disconnected by socket itself.
  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
    if(user){
      io.to(user.room).emit("message", generateMessage('Admin', `${user.username} has left !`));

      io.to(user.room).emit("roomData", {
        roomName: user.room,
        allUsersInRoom: getUsersInRoom(user.room),
      });
    }
    // io.emit("message", generateMessage("A User has Left!"));
  });
})

server.listen(port, () => {
  console.log("Server starts running on the port " + port);
});
