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
    window.location.href = '/index.html';
  }

  static async login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message ||
        data.error   ||
        'Incorrect email or password. Please try again.'
      );
    }

    const token = data.token || data.accessToken || data.access_token || '';
    localStorage.setItem('so-token', token);
    localStorage.setItem('so-user', JSON.stringify({
      email,
      name: data.name || data.firstName || email.split('@')[0]
    }));
    return data;
  }

  static async register(name, email, password) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Common errors from this API
      if (res.status === 400) {
        throw new Error(data.message || 'This email may already be registered. Try signing in instead.');
      }
      if (res.status === 409) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      throw new Error(data.message || data.error || 'Registration failed. Please try again.');
    }

    // Auto-login after successful register
    try {
      await Auth.login(email, password);
    } catch {
      // If auto-login fails, store token from register response if available
      const token = data.token || data.accessToken || data.access_token || '';
      if (token) {
        localStorage.setItem('so-token', token);
        localStorage.setItem('so-user', JSON.stringify({ email, name }));
      }
    }

    return data;
  }
}