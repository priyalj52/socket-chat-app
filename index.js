const { Server } = require("socket.io");

const io = new Server({ 
  cors: {
      // origin: ["http://localhost:3000", "https://wechattt.netlify.app/"],
      origin:"*",
      methods: ["GET", "POST"]
  }
});
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on("addNewUser", (userID) => {
    //lisren to a connection //whenever the client triggers addnewuser event we'll pass ID to it
    //before adding check if that client isnt already presnt in array
    //  use some array method
    !onlineUsers.some((user) => user?.userID === userID) &&
      //dding connected user means online user
      onlineUsers.push({
        userID,
        socketID: socket.id,
      });
    console.log("online users", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMsg", (msg) => {
    console.log("Received message:", msg); // Log the message you're receiving
    console.log(msg.recipientUserId, "hi reciever");
    // const user = onlineUsers.find((user) => {
    //   console.log("user.userID", user.userID,msg.recipientUserId); // Log the user's userID
    
    //   return user.userID === msg.recipientUserId;
    // });
    console.log("online in send time",onlineUsers)
    const userExist=onlineUsers?.find((user)=>user.userID===msg.recipientUserId)
    
    console.log("msg in socket", userExist);
    if (userExist) {
      io.to(userExist.socketID).emit("getTextMessage", msg);
      io.to(userExist.socketID).emit("getNotif", {
        senderId: msg?.senderId,
        isRead: false,
        date: new Date(),
      });
    } else {
      console.log("user is not online");
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers?.filter((user) => user.socketID !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
  socket.on("connect", () => {
    console.log(socket.connected, "yo000"); // true
  });
});

io.listen(5000, () => {
  console.log("server started on port", 5000);
});
