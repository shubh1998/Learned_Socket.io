const users = []

// Add User (New User Joined)
const addUser = ({ id, username, room })=>{
    //Clean data
    username = username.trim().toLowerCase()
    room = room.trim()

    // Validate data
    if(!username || !room){
        return {
            error: 'Username and room are required !'
        }
    }
    
    //Check if username already taken by some other in a room
    const existingUser = users.find(user => {
        return (user.room === room && user.username === username)
    })
    if(existingUser){
        return {
            error: "Username has already been taken by someone else !"
        }
    }

    // Store user if it is valid
    const user = { id, username, room }
    users.push(user)
    return {
        user
    }
}

// Remove User (User Left)
const removeUser = (id)=>{
    // findIndex method returns a index of element i.e equal or greater than 0 at which it is found in array. If it not finds in array, it returns -1.
    const index = users.findIndex((user) => (user.id === id))

    if(index !== -1){
        // splice method helps us to remove a specific index and its value from an array
        return users.splice(index, 1)[0]
    }
}

// Get User (Allow us to fetch existing user data)
const getUsers = (id)=>{
     return users.find((user) => user.id === id);
}

// Get Users In Room (Allow us to fetch existing user in a room)
const getUsersInRoom = (room)=>{
    room = room.trim()
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUsers,
    getUsersInRoom
}