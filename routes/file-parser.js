const express = require("express");
const fileUploader = require("../controllers/file-parser/file-upload-controller");
const upload = require("../helpers/file-upload-helper");
const router = express.Router();

router.post("/fileparse", upload.single("file"), fileUploader.handleFileUpload);

module.exports = router;
