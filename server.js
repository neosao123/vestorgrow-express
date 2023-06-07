const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const { Server } = require("socket.io");

const cors = require("cors");
const port = process.env.PORT || 3000;
var useragent = require("express-useragent");
mongoose.connect("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to mongo database");
});

mongoose.connection.on("error", (err) => {
  console.log("Error at mongoDB: " + err);
});

var app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: "200mb" }));
app.use(bodyParser.json({ limit: "200mb" }));
// app.use(
//   bodyParser.json({
//     limit: "20mb",
//     verify: (req, res, buf) => {
//       req.rawBody = buf;
//     },
//   })
// );
app.use(useragent.express());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// import routes
const userRoute = require("./routes/user.route");
const userFollower = require("./routes/userFollower.route");
const postRoute = require("./routes/post.route");
const lessonRoute = require("./routes/lesson.route");
const categoryRoute = require("./routes/category.route");
const learningMaterialRoute = require("./routes/learningMaterial.route");
const webinarRoute = require("./routes/webinar.route");
const learningMaterialCatRoute = require("./routes/learningMaterialCategory.route");
const webinarCatRoute = require("./routes/webinarCategory.route");
const postCommentRoute = require("./routes/postComment.route");
const userPostHiddenRoute = require("./routes/userPostHidden.route");
const postLikeRoute = require("./routes/postLike.route");
const commentReplyRoute = require("./routes/commentReply.route");
const commentLikeRoute = require("./routes/commentLike.route");
const ReplyLikeRoute = require("./routes/replyLike.route");
const PostShareRoute = require("./routes/postShare.route");
const DiscoverRoute = require("./routes/discover.route");
const BannerRoute = require("./routes/banner.route");
const UserBlocked = require("./routes/userBlocked.route");
const NotificationRoute = require("./routes/notification.route");
const NewsRoute = require("./routes/news.route");
const ChatRoute = require("./routes/chat.route");
const MessageRoute = require("./routes/message.route");
const GlobalMessageRoute = require("./routes/globalMessage.route");
const ReportPostRoute = require("./routes/reportPost.route");
const TestimonialRoute = require("./routes/testimonial.route");
const GoogleSignUpRoute = require("./routes/googleSignUp.route");
const PaymentRoute = require("./routes/payment.route");

// New Routes
app.use("/api/v1/auth/google/callback", GoogleSignUpRoute);
app.use("/testimonial", TestimonialRoute);
app.use("/user", userRoute);
app.use("/follow", userFollower);
app.use("/course", lessonRoute);
app.use("/category", categoryRoute);
app.use("/learningmaterial", learningMaterialRoute);
app.use("/webinar", webinarRoute);
app.use("/learningmaterial_category", learningMaterialCatRoute);
app.use("/webinar_category", webinarCatRoute);
app.use("/post", postRoute);
app.use("/postcomment", postCommentRoute);
app.use("/userposthide", userPostHiddenRoute);
app.use("/postlike", postLikeRoute);
app.use("/commentlike", commentLikeRoute);
app.use("/commentreply", commentReplyRoute);
app.use("/replylike", ReplyLikeRoute);
app.use("/share", PostShareRoute);
app.use("/discover", DiscoverRoute);
app.use("/banner", BannerRoute);
app.use("/blockuser", UserBlocked);
app.use("/notification", NotificationRoute);
app.use("/news", NewsRoute);
app.use("/chat", ChatRoute);
app.use("/message", MessageRoute);
app.use("/globalmessage", GlobalMessageRoute);
app.use("/report", ReportPostRoute);
app.use("/payment", PaymentRoute);

let server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  // console.log("socket is connected ");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  
  socket.on("newMessage", (newMessage) => {
    var chat = newMessage.users;

    if (!chat) return console.log("chat.users not defined");
    chat.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("messageRecieved", newMessage);
    });
  });
});

app.use(function (err, req, res, next) {
  if (err.status) {
    res.status(err.status).send(err);
  } else {
    res.status(404).json(err);
  }
});

server.listen(port, () => {
  console.log(`Server is starting at http://localhost:${port}`);
});
