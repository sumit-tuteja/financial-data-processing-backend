const express = require("express");
const dataMapper = require("../controllers/data-map/data-mapping-controller");
const upload = require("../helpers/file-upload-helper");
const router = express.Router();

router.post("/map-values", upload.single("file"), dataMapper.handleDataMap);

module.exports = router;
