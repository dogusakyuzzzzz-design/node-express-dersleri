const express = require("express");
const usersRouter = require("./routes/users");
const logger = require("./middlewares/logger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("Merhaba, bu benim ilk Express sunucum!");
});

app.use("/users", usersRouter);
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Sunucu çalışıyor: http://localhost:" + PORT);
  });
}

module.exports = app;