const jwt = require('jsonwebtoken');

/**
 * 認証処理
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function authenticate(req, res, next) {
  try {
    const token = req.get('Authorization');
    let valid = false;

    if (token) {
      const data = jwt.verify(token.replace(/^Bearer /, ''), process.env.JWT_SIGN_KEY);
      if (data.user === 'admin') {
        valid = true;
      }
    }

    if (!valid) {
      // 401 Unauthorized
      const err = new Error('Unauthorized');
      err.status = 401;
      next(err);
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
