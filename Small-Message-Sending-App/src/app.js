const path= require('path');
// Need to use http explicitely because a socket function takes server as a argument
const http = require('http');
const express = require('express');
const socketio = require('socket.io')

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
    console.log('New WebSocket connection ')
    // Emit a message from server to client 
    socket.emit('message', "Welcome to chat app")
    // Emit a message from server to client (Note: send message to every connection except one user who recently newly joined.)
    socket.broadcast.emit('message', 'New user joined !')

    socket.on('sendMessage', (sendedMessage)=>{
      // Emit a message from server to client (Note: we write "io.emit" because we need to notify every connection, If we want to notify a single connection use "socket.emit".)
      io.emit("message", sendedMessage);
    })

    // Note: 'connection' and 'disconnect' are the inbuilt events of socket. During 'disconnect' event we didn't got message in callback param because the connection disconnected by socket itself.
    socket.on('disconnect', ()=>{
        io.emit('message', 'A User has Left!')
    })
})

server.listen(port, () => {
  console.log("Server starts running on the port " + port);
});
