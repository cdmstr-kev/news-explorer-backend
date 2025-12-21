const articles = require("../controllers/articles");
const express = require("express");
const auth = require("../middlewares/auth");
const {
  validateArticleCreation,
  validateArticleId,
} = require("../middlewares/validation");

const router = express.Router();

const { getArticles, createArticle, deleteArticle } = articles;

router.post("/", auth, validateArticleCreation, createArticle);
router.get("/", auth, getArticles);
router.delete("/:id", auth, validateArticleId, deleteArticle);

module.exports = router;
