const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const { errors } = require("celebrate");
const cors = require("cors");
const limiter = require("./middlewares/rateLimiter");
const routes = require("./routes");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();
const { PORT = 3000 } = process.env;

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

app.use(routes);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    app.listen(PORT, () => {});
  })
  .catch(() => {
    console.error("❌  DB error:", err);
    process.exit(1);
  });
