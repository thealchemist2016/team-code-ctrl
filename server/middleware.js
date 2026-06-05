const jwt = require('jsonwebtoken');
const secret = 'gracie';
const db = require('./db');

const withAuth = function(req, res, next) {
  const token = 
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token;

  if(!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if(err) {
        res.status(401).json({ success: false, error: 'Invalid token' });
      } else {
        req.username = decoded.username;
        next();
      }
    });
  }
}

const adminOnly = function(req, res, next) {
  if (!req.username) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }
  const user = db.findUserByUsername(req.username);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
  }
  next();
}

withAuth.withAuth = withAuth;
withAuth.adminOnly = adminOnly;

module.exports = withAuth;
