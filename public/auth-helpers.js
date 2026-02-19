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

// Session timeout - auto-logout after 30 minutes of inactivity
(function initSessionTimeout() {
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  let timeoutId = null;

  function resetTimer() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const token = localStorage.getItem('vif-token');
      if (token) {
        localStorage.removeItem('vif-token');
        localStorage.removeItem('vif-user');
        alert('Your session has expired due to inactivity. Please log in again.');
        window.location.href = '/';
      }
    }, TIMEOUT_MS);
  }

  // Track user activity
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });

  // Start timer
  resetTimer();
})();
