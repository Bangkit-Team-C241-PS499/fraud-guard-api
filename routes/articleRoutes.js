const express = require("express");
const {
  getArticles,
  getArticleDetail,
} = require("../controllers/articleController");

const router = express.Router();

router.get("/", getArticles);
router.get("/:id", getArticleDetail);

module.exports = router;
