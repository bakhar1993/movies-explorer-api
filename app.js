const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const router = require('./routes/index');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
mongoose.connect('mongodb://localhost:27017/bitfilmsdb');
app.use(router);

app.use(errorLogger);
app.use(errors());

app.listen(PORT, () => {
  console.log(`Приложение запущено на порту: ${PORT}`);
});
