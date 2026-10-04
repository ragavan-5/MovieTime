// require('dotenv').config()
// const express = require('express')
// const cors = require('cors')
// const app = express()
// const port = process.env.PORT || 4000
// app.use(cors({ origin: true }))
// app.use(express.json())
// const authRoutes = require('./src/routes/auth')
// const moviesRoutes = require('./src/routes/movies')
// const bookingsRoutes = require('./src/routes/bookings')
// app.use('/api/auth', authRoutes)
// app.use('/api/movies', moviesRoutes)
// app.use('/api/bookings', bookingsRoutes)
// app.get('/', (req,res)=> res.send({ok:true, msg:'MovieTime backend'}))
// app.listen(port, ()=> console.log('Server running on port', port))













require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: true
  })
);

app.use(express.json());

const authRoutes = require("./src/routes/auth");
const moviesRoutes = require("./src/routes/movies");
const bookingsRoutes = require("./src/routes/bookings");

app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/bookings", bookingsRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    msg: "MovieTime backend"
  });
});

app.listen(port, () => {
  console.log(
    `Server running on port ${port}`
  );
});