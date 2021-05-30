const socket = io()

// Listening a message event from server 
socket.on('message',(EmittedMessage)=>{
    console.log(EmittedMessage)
})

document.querySelector("#message-form").addEventListener('submit', (e)=>{
    e.preventDefault();
    const typedMessage = e.target.elements.message.value
    // Emit a message from client to server 
    socket.emit('sendMessage', typedMessage)
})