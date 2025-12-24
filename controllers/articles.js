const Article = require("../models/article");
const BadRequestError = require("../utils/badRequestError");
const NotFoundError = require("../utils/notFoundError");
const { SUCCESSFUL, CREATED } = require("../utils/success");
const ForbiddenError = require("../utils/forbiddenError");

const getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ owner: req.user._id }).sort({
      _id: -1,
    });

    return res.status(SUCCESSFUL).json(articles);
  } catch (err) {
    return next(err);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const { keyword, title, text, date, source, link, image } = req.body;
    const article = await Article.create({
      keyword,
      title,
      text,
      date,
      source,
      link,
      image,
      owner: req.user._id,
    });
    return res.status(CREATED).json(article);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError(err.message));
    }
    return next(err);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id).orFail(
      () => new NotFoundError("Article not found")
    );

    if (article.owner.toString() !== req.user._id.toString()) {
      return next(new ForbiddenError("You cannot delete this article!"));
    }
    await article.deleteOne();

    return res.status(SUCCESSFUL).json({ message: "Article deleted successfully!" });
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("invalid article ID"));
    }
    return next(err);
  }
};

module.exports = { getArticles, createArticle, deleteArticle };
