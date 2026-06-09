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

    let data = {};
    try { data = await res.json(); } catch(e) { /* empty */ }

    console.log('Login response status:', res.status);
    console.log('Login response data:', data);

    if (!res.ok) {
      throw new Error(
        data.message ||
        data.error   ||
        data.msg     ||
        `Login failed (${res.status}). Check your credentials.`
      );
    }

    // Try all possible token field names
    const token =
      data.token        ||
      data.accessToken  ||
      data.access_token ||
      data.jwt          ||
      '';

    if (!token) {
      console.warn('No token found in response:', data);
    }

    localStorage.setItem('so-token', token);
    localStorage.setItem('so-user', JSON.stringify({
      email,
      name: data.name || data.firstName || data.username || email.split('@')[0]
    }));
    return data;
  }

  static async register(name, email, password) {
    // Try with 'name' field first, then fallback to firstName/lastName
    const body = { name, email, password };

    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    let data = {};
    try { data = await res.json(); } catch(e) { /* empty */ }

    console.log('Register response status:', res.status);
    console.log('Register response data:', data);

    if (!res.ok) {
      if (res.status === 400) {
        throw new Error(data.message || 'Invalid data. Check all fields.');
      }
      if (res.status === 409 || (data.message && data.message.toLowerCase().includes('exist'))) {
        throw new Error('Email already registered. Please sign in instead.');
      }
      throw new Error(data.message || data.error || `Registration failed (${res.status}).`);
    }

    // Auto-login after register
    try {
      await Auth.login(email, password);
    } catch(e) {
      console.warn('Auto-login after register failed:', e.message);
      // Store whatever token came from register
      const token = data.token || data.accessToken || data.access_token || '';
      if (token) {
        localStorage.setItem('so-token', token);
        localStorage.setItem('so-user', JSON.stringify({ email, name }));
      }
    }

    return data;
  }

  // Use token to make authenticated requests
  static async fetchWithToken(url, options = {}) {
    const token = Auth.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    if (res.status === 401) {
      Auth.logout();
      throw new Error('Session expired. Please sign in again.');
    }

    return res;
  }
}