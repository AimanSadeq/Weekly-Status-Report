// Shared auth helpers for VIFM Activity Tracker

function getAuthToken() {
  return localStorage.getItem('vif-token');
}

function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

async function authFetch(url, options = {}) {
  const headers = getAuthHeaders();
  // Merge provided headers with auth headers (auth headers take precedence)
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  options.headers = headers;

  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token expired or invalid — clear auth state and redirect to login
    localStorage.removeItem('vif-token');
    localStorage.removeItem('vif-user');
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  return response;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
