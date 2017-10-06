const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

require("./routes") (app, {});

const port = 8000;
app.listen(port, () => {
  console.log('We are live on ' + port);
});