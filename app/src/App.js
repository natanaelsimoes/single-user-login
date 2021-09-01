import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import localForage from 'localforage';
import io from 'socket.io-client';
import './App.css';

const { REACT_APP_API } = process.env;

const socket = io(REACT_APP_API, { forceNew: true, reconnectionDelay: 5000 });

localForage.config({ name: 'single-user-login' });

function getConnection(token) {
  return axios.create({
    baseURL: REACT_APP_API,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

function App() {
  const [initialized, setInitialized] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const refreshToken = useCallback(async () => {
    const t = await localForage.getItem('Token');
    const api = getConnection(t);
    try {
      const { data } = await api.get('/');
      await localForage.setItem('Token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch {
      setUser(false);
    } finally {
      setInitialized(true);
      socket.off('logged', refreshToken);
    }
  }, []);

  const init = useCallback(async () => {
    const t = await localForage.getItem('Token');
    socket.emit('login', t);
    socket.on('connect', () => {
      socket.emit('login', t);
    });
    socket.on('logged', refreshToken)
  }, [refreshToken]);

  async function login(e) {
    e.preventDefault();
    const api = getConnection();
    try {
      const { data } = await api.post('/login', form);
      await localForage.setItem('Token', data.token);
      setToken(data.token);
      setUser(data.user);
      setError(null);
      socket.emit('login', token);
    } catch (e) {
      setForm({});
      setError(e.response.data);
    }
  }

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (token) setTimeout(refreshToken, 300000); // in 5 min
  }, [refreshToken, token]);

  if (!initialized) return 'App loading...';

  return (
    <div className="App">
      <header className="App-header">
        {error}
        {!user && <form onSubmit={login}>
          <input
            type="text" name="username" placeholder="Username" required
            value={form.username ?? ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <input type="password" name="password" placeholder="Password" required
            value={form.password ?? ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <button type="submit">Sign in</button>
        </form>}
        {user && <h1>Welcome back, {user.username}!</h1>}
      </header>
    </div>
  );
}

export default App;
