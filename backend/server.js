const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/users"));
app.use("/", require("./routes/matches"));
app.use("/", require("./routes/messages"));
app.use(cookieParser());
const dbo = require("./db/conn");
app.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});
