import jwt from 'jsonwebtoken';
import Socket from './Socket';
import Users from './Users';

const { SECRET } = process.env;

function verifyJWT(req, res, next) {
  const token = req.header('Authorization') ? req.header('Authorization').match(/^Bearer (.+)$/)[1] : null;
  if (!token) {
    return res
      .status(401)
      .send('No access token provided.');
  }
  return jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .send('Failed to authenticate token.');
    }
    const sLogged = Socket._users.find((u) => u.user.id === user.id);
    if (!sLogged) {
      return res.status(401).send('You must connect to socket to continue.');
    }
    req.user = user;
    if (next) return next();
    return true;
  });
}

async function status(req, res) {
  try {
    const user = Users.find((u) => u.id === req.user.id);
    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: 600, // expires in 10 min
    });
    res.json({ auth: true, token, user });
  } catch (e) {
    res
      .status(401)
      .send('Failed to authenticate token.');
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = Users.find((u) => u.username === username && u.password === password);
  const sLogged = Socket._users.find((u) => u.user.id === user.id);
  if (sLogged) {
    return res.status(401).send('User already logged in.');
  }
  if (user) {
    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: 600, // expires in 10 min
    });
    return res.json({ auth: true, token, user });
  }
  return res.status(401).send('Invalid credentials.');
}

export default { verifyJWT, status, login };
