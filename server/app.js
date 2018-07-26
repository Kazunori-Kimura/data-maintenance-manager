require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3080;

// DatabaseManagerインスタンスを保持する
const db = require('./models');
app.set('db', db);

// body-parserの設定
// json返すだけ
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
app.use(cors({
  exposedHeaders: [
    'Content-Range'
  ]
}));

// no cache
app.use((req, res, next) => {
  res.header('Cache-Control', ['private', 'no-store', 'no-cache', 'must-revalidate', 'proxy-revalidate'].join(','));
  res.header('no-cache', 'Set-Cookie');
  next();
});

//
// 管理画面
//
app.use('/', express.static(path.resolve(__dirname, 'views')));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views', 'index.html'));
});

//
// API
//
// ミドルウェア
const authenticate = require('./middlewares/authenticate');
// ルーティング
const loginRouter = require('./routes/login');
const indexRouter = require('./routes');
/*
 * /api/login
 */
app.use('/api/login', loginRouter);
/*
 * /api/:tablename
 */
app.use('/api', authenticate, indexRouter);

/*
 * 404 Not Found
 */
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/*
 * error handler
 */
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.locals.message = message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }

  // logging用にresにerrをセット
  res.err = err;

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.status(status);
  res.send({ status, message });
});


app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
