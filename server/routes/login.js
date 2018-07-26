const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST: /login
router.post('/',
  /**
   * 入力のvalidate
   */
  (req, res, next) => {
    try {
      const username = req.body.username || '';
      const password = req.body.password || '';
      const valid = username === 'admin' && password === 'password';

      if (!valid) {
        const err = new Error('Bad Request');
        err.status = 400;
        next(err);
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  /**
   * レスポンスを返す
   */
  (req, res, next) => {
    try {
      const token = jwt.sign({ user: 'admin' }, process.env.JWT_SIGN_KEY);

      res.header('Content-Type', 'application/json; charset=utf-8');
      res.status(200);
      res.send({ token });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
