import socket from 'socket.io';
import jwt from 'jsonwebtoken';
import App from './App';

const { SECRET } = process.env;

class Socket {
  static options = {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    cookie: {
      name: 'single-user-login-io',
      httpOnly: false,
      path: '/',
    },
  };

  _users = [];

  init(HttpServer) {
    this._io = socket(HttpServer, Socket.options);
    this._bindSocketFunctions();
    App.locals.io = this._io;
    App.locals.users = this._users;
  }

  _bindLogin(sck) {
    sck.on('login', (token) => {
      console.log('Socket: Login requested');
      jwt.verify(token, SECRET, (err, user) => {
        console.log('Socket: Checking if user is not already in');
        if (!err && !this._users.find((u) => u.user === user)) {
          console.log('Socket: Pushing user in');
          this._users.push({ user, socket: sck.id });
          console.log('Socket: Logged users', this._users);
          sck.user = user;
          sck.emit('logged', true);
        } else {
          console.log('Socket: User already in');
          sck.emit('logged', false);
        }
      });
    });
  }

  _bindDisconnect(sck) {
    sck.on('disconnect', () => {
      const { user } = sck;
      console.log('Socket: Connection lost with user', user?.id);
      const uIndex = this._users.findIndex((u) => u.user === user);
      if (uIndex >= 0) {
        this._users.splice(uIndex, 1);
      }
    });
  }

  _bindSocketFunctions() {
    this._io.on('connection', this._bindLogin.bind(this));
    this._io.on('connection', this._bindDisconnect.bind(this));
  }
}

export default new Socket();
