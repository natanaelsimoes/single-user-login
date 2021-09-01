import http from 'http';
import App from './App';
import Socket from './Socket';

const Server = http.createServer(App);

Socket.init(Server);

Server.listen(process.env.PORT || 5000, () => {
  console.log('Server running on', process.env.PORT || 5000);
});
