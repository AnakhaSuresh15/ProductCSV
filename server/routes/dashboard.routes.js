const express = require("express");
const { uploadFile, getView } = require("../controllers/dashboard.controller");
const multer = require("multer");
const {authCheck} = require("../utils/Token");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single("file"), uploadFile);
router.get('/view', getView);

module.exports = router;