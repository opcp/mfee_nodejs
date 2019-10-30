const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const morgan = require("morgan");
const body_parser = require("body-parser");
const axios = require("axios");

const app = express();
const db = mysql.createConnection({
  host: "192.168.27.186",
  user: "shan",
  password: "opcp2428",
  database: "pbook"
});
db.connect(error => {
  if (error) {
    return error;
  }
});

const whitelist = [
  "http://localhost:3001",
  "http://localhost:3000",
  undefined
];
const corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true); //允許
    } else {
      // callback(new Error('not found data'))
      callback(null, false); //不允許
    }
  }
};
app.use(cors(corsOptions));

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ success: true });
});
app.get("/reviews", (req, res) => {
  const sql = "SELECT * FROM `vb_categories` WHERE 1";
  db.query(sql, (error, results) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.listen(4000, () => {
  console.log("4000 連結成功");
});
