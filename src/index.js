const express = require("express");
const url = require("url");
const mysql = require("mysql");
const cors = require("cors");
const morgan = require("morgan");
const body_parser = require("body-parser");
const axios = require("axios");
const bluebird = require("bluebird");

const app = express();
const db = mysql.createConnection({
  // host: "192.168.27.186",
  host: "localhost",
  user: "opcp",
  password: "opcp2428",
  database: "pbook"
});
db.connect(error => {
  if (error) {
    return error;
  }
});
bluebird.promisifyAll(db);

const whitelist = ["http://localhost:3001", "http://localhost:3000", undefined];
const corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
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

// app.get("/re/", (req, res) => {
//   const urlpart = url.parse(req.url, true);
//   console.log(urlpart);
// });

//分類
app.post("/categoryBar", (req, res) => {
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

// let c = "";
// if (req.params.category != undefined) {
//   c = "=" + req.params.category;
// }
// let a = req.params.array;
// if (req.params.array == 1) {
//   a = "page";
// } else if (req.params.array == 2) {
//   a = "publish_date";
// } else {
//   a = "fixed_price";
// }
// /reviews/:category?/:array?/:page?
// `SELECT * FROM vb_books LIMIT ${(page - 1) * perPage},${perPage}`
// SELECT * FROM `vb_books` WHERE `categories` = 16 ORDER BY `publish_date` DESC LIMIT 5
//書本內容
app.get(`/reviews/?`, (req, res) => {
  const urlpart = url.parse(req.url, true);
  if (urlpart.query.c != undefined) {
    c = "=" + urlpart.query.c;
  } else {
    c = "";
  }

  if (urlpart.query.a == 1) {
    a = "publish_date";
  }else if(urlpart.query.a == 2){
    a = "page"
  }else{
    a = "fixed_price"
  }
  page = urlpart.query.p || 1;
  let perPage = 10;
  let output = {};
  db.queryAsync("SELECT COUNT(1) total FROM `vb_books`")
    .then(results => {
      output.total = results[0].total;
      return db.queryAsync(
        `SELECT * FROM vb_books WHERE categories ${c} ORDER BY ${a} DESC LIMIT ${(page -
          1) *
          perPage},${perPage}`
      );
    })
    .then(results => {
      output.rows = results;
      res.json(output);
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
});

app.get("/list/:sid?", (req, res) => {
  let sid = req.params.sid;
  console.log(sid);
  const sql = `SELECT * FROM vb_books WHERE sid=${sid}`;
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

app.use((req, response) => {
  response.type("text/plain");
  response.status(404);
  response.send(`404 找不到頁面喔`);
});

app.listen(5555, () => {
  console.log("5555 連結成功");
});
