const socket = io()

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector("button");
const $shareLocationButton = document.querySelector("#share-location");
const $messages = document.querySelector("#messages");

//Template
const $messageTemplate = document.querySelector("#message-template").innerHTML
const $locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options - extract query string from url
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = ()=>{
  // New message Element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  
  // Visible Height
  const visibleHeight = $messages.offsetHeight
  
  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have i scrolled
  scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
    console.log($messages.scrollTop)
  }
}

// Listening a message event from server 
socket.on('message',(EmittedMessage)=>{
    // Render message dynamically template
    const html = Mustache.render($messageTemplate, {
      message: EmittedMessage.text,
      createdAt: moment(EmittedMessage.createdAt).format("h:mm A"),
      UserName: EmittedMessage.username,
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

// Listening a locationMesssage from server
socket.on("locationMessage", (EmittedLocationMessage)=>{
    // console.log(EmittedLocationMessage)
    const html = Mustache.render($locationMessageTemplate, {
      locationURLmessage: EmittedLocationMessage.text,
      createdAt: moment(EmittedLocationMessage.createdAt).format("h:mm A"),
      LocationUserName: EmittedLocationMessage.username,
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Disable form button untill messsage gets delievered.
    $messageFormButton.setAttribute("disabled", "disabled");

    const typedMessage = e.target.elements.message.value;

    // Emit a message from client to server and For acknowledgement purpose, we use callback here
    socket.emit("sendMessage", typedMessage, (error) => {
      // Enable form button untill messsage gets delievered.
      $messageFormButton.removeAttribute("disabled");
      // To clear input of form and do focus on that
      $messageFormInput.value = '';
      $messageFormInput.focus()

      if (error) {
        return console.log(error);
      }
      console.log("Message Delievered !");
    });
});

$shareLocationButton.addEventListener("click", () => {
    $shareLocationButton.setAttribute("disabled", "disabled");
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit(
        "shareLocation",
        `http://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
        () => {
            $shareLocationButton.removeAttribute("disabled");
            console.log("Location shared !");
        }
        );
    });
});

socket.emit('join', { username, room }, (error)=>{
  if(error){
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData', ({ roomName, allUsersInRoom })=>{
  // console.log(roomName, allUsersInRoom);
  // Render message dynamically template
  const html = Mustache.render($sidebarTemplate, {
    roomName,
    users: allUsersInRoom,
  });
  document.querySelector("#sidebar").innerHTML = html
})