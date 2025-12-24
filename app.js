const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const limiter = require("./middlewares/rateLimiter");
const userRouter = require("./routes/users");
const articlesRouter = require("./routes/articles");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const { errors } = require("celebrate");
dotenv.config();

const app = express();
const { PORT = 3001 } = process.env;

const { DATABASE_URL } = process.env;

app.use(helmet());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://newsexplorer.cdmstr.com", // Production frontend
  "https://www.newsexplorer.cdmstr.com", // Production frontend with www
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV === "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
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
