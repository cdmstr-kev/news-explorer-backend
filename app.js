const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const { errors } = require("celebrate");
const cors = require("cors");
const limiter = require("./middlewares/rateLimiter");
const userRouter = require("./routes/users");
const articlesRouter = require("./routes/articles");
const { requestLogger, errorLogger } = require("./middlewares/logger");

dotenv.config();

const app = express();
const { PORT = 3001 } = process.env;

const { DATABASE_URL } = process.env;

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "https://newsexplorer.cdmstr.com",
  "https://www.newsexplorer.cdmstr.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        !process.env.NODE_ENV === "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);
app.use(limiter);

app.use("/users", userRouter);
app.use("/articles", articlesRouter);

app.use(errorLogger);
app.use(errors());

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌  DB error:", err);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.log(err);
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? "An error occurred on the server" : message,
  });
});
