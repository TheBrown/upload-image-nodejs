const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");

const fs = require("fs");
const uploads = "./public/uploads";

const d = new Date();
const month = d.getMonth();
const year = d.getFullYear();

if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);

if (!fs.existsSync(uploads + "/" + year)) fs.mkdirSync(uploads + "/" + year);

if (!fs.existsSync(uploads + "/" + year + "/" + month)) fs.mkdirSync(uploads + "/" + year + "/" + month);


// Set Storage Engine
const storage = multer.diskStorage({
  destination: `${uploads}/${year}/${month}/`,
  filename: (req, file, callback) => {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("my-signature-image");

// Check File
function checkFileType(file, cb) {
  // Allowed Extension
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

const app = express();

// EJS
app.set("view engine", "ejs");

// Public folder
app.use(express.static("./public"));

app.get("/", (req, res) => res.render("index"));

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "No File Selected!"
        });
      } else {
        res.render("index", {
          msg: "File Uploaded!",
          file: `uploads/${year}/${month}/${req.file.filename}`
        });
      }
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, console.log(`Listen at port ${port}`));
