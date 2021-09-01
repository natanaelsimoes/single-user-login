import express from 'express';
import CORS from 'cors';
import Helmet from 'helmet';
import Compression from 'compression';
import Auth from './Auth';

const App = express();

App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(Helmet());
App.use(Compression());
App.use(CORS());

App.get('/', Auth.verifyJWT, Auth.status);
App.post('/login', Auth.login);

export default App;
