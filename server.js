const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const cors = require("cors");
const fileParserRoutes = require("./routes/file-parser.js");
const dataMapRoutes = require('./routes/data-map.js');

app.use(bodyParser.json());
app.use(cors());
app.use("/api/v1", fileParserRoutes);
app.use("/api/v1", dataMapRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
