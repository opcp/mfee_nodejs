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
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

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
//SELECT COUNT(1) FROM `vb_books` WHERE categories ${c}
//書本內容
app.get(`/reviews/?`, (req, res) => {
  const urlpart = url.parse(req.url, true);
  if (urlpart.query.c !== undefined) {
    c = "=" + urlpart.query.c;
  } else {
    c = "";
  }

  if (urlpart.query.a == 1) {
    a = "publish_date";
  } else if (urlpart.query.a == 2) {
    a = "page";
  } else {
    a = "fixed_price";
  }
  page = urlpart.query.p || 1;
  let perPage = 10;
  let output = {};
  let output_count = {}
  db.queryAsync(`SELECT COUNT(1) total FROM vb_books WHERE categories ${c}`)
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
  db.queryAsync(
    `SELECT COUNT(1) total FROM vb_books WHERE categories ${c}`
  ).then(count=> {
    output_count = count[0].total
    // res.json(output)
    console.log(count[0].total);
  });
});

//書本單筆資料
app.get("/book_reviews/:sid?", (req, res) => {
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

//書本各分類數量

app.use((req, response) => {
  response.type("text/plain");
  response.status(404);
  response.send(`404 找不到頁面喔`);
});

app.listen(5555, () => {
  console.log("5555 連結成功");
});
