const API_BASE = 'https://wdd330-backend.onrender.com';

export default class Auth {
  static getToken() {
    return localStorage.getItem('so-token');
  }

  static isLoggedIn() {
    return !!Auth.getToken();
  }

  static getUser() {
    const u = localStorage.getItem('so-user');
    return u ? JSON.parse(u) : null;
  }

  static logout() {
    localStorage.removeItem('so-token');
    localStorage.removeItem('so-user');
    window.location.href = '/';
  }

  // POST /login  { email, password }
  static async login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid credentials');
    }
    const data = await res.json();
    localStorage.setItem('so-token', data.token || data.accessToken || '');
    localStorage.setItem('so-user', JSON.stringify({ email, name: data.name || email }));
    return data;
  }

  // POST /users  { name, email, password }
  static async register(name, email, password) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    // Auto-login after register
    await Auth.login(email, password);
    return data;
  }
}