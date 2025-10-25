const express = require('express'); // web framwork for handle http request and response. it is a nodejs framework. 
const config = require("./src/config/config");
const db = require("./src/config/db");

// while the error of jwt_secret logic one 
require('dotenv').config();


// import routes
const authRoutes = require('./src/Routes/authRoute');
const userRoutes = require("./src/Routes/userRoute");
const blogRoutes = require('./src/Routes/blogRoute');

// for like and comments
const commentRoutes = require('./src/Routes/commentRoute');
const likeRoutes = require('./src/Routes/likeRoute');

const app = express();

app.use(express.json());

// Connect to the database
db.connect();

// routers
app.use("/api/auth/v1", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);

app.use('/api/comments', commentRoutes);
app.use('/api/likes', require('./src/Routes/likeRoute'));


const port = config.PORT; 

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



module.exports = db;


