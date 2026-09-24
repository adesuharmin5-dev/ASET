/**
 * AssetCare Client Application
 * Clean, structured, anti-slop operational dashboard
 */

// Global State
const state = {
  token: localStorage.getItem('assetcare_token') || '',
  user: null,
  company: null,
  signature: null,
  activeTab: 'dashboard',
  masterTab: 'categories',
  reportTab: 'recap',
  maintStatusFilter: 'Semua',
  assetSearch: '',
  assetCatFilter: '',
  assetRoomFilter: '',
  assetCondFilter: '',
  cache: {
    categories: [],
    rooms: [],
    conditions: [],
    pics: []
  }
};

// SVG Icons
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  master: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  assets: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  maintenance: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  reports: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  docs: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  upload: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  print: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
};

// State Theme
state.theme = localStorage.getItem('aurora_theme') || 'dark';

// Utilities
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0);
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function copyToClipboard(text, label = 'Kode') {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} '${text}' berhasil disalin!`);
    }).catch(() => fallbackCopy(text, label));
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  showToast(`${label} '${text}' berhasil disalin!`);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('aurora_theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = `${state.theme === 'light' ? icons.moon : icons.sun} <span>${state.theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>`;
  }
}

// API Helper
async function api(endpoint, options = {}) {
  const headers = options.headers || {};
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      localStorage.removeItem('assetcare_token');
      state.token = '';
      state.user = null;
      renderApp();
      showToast('Sesi telah berakhir. Silakan login kembali.', 'error');
      throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Terjadi kesalahan sistem.');
    }
    return data;
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast(err.message, 'error');
    }
    throw err;
  }
}

// Fetch Cache Master Data
async function refreshMasterCache() {
  if (!state.token) return;
  try {
    const [cats, rms, cnds, pcs] = await Promise.all([
      api('/master/categories'),
      api('/master/rooms'),
      api('/master/conditions'),
      api('/master/pics')
    ]);
    state.cache.categories = cats.data || [];
    state.cache.rooms = rms.data || [];
    state.cache.conditions = cnds.data || [];
    state.cache.pics = pcs.data || [];
  } catch (e) {
    console.error('Failed caching masters', e);
  }
}

// Modal Manager
function openModal(htmlContent, onReady) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal-overlay';
  overlay.innerHTML = htmlContent;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  if (onReady) onReady(overlay);
}

function closeModal() {
  const existing = document.getElementById('active-modal-overlay');
  if (existing) existing.remove();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Company Profile Helper
async function loadCompanyProfile() {
  try {
    const res = await api('/settings/company');
    if (res && res.data) {
      state.company = res.data;
    }
  } catch (e) {
    state.company = {
      app_name: 'Aurora Aset',
      company_name: 'PT Aurora Nusantara',
      address: 'Jl. Merdeka No. 45, Gedung Aurora Lantai 3',
      phone: '(021) 555-8921',
      email: 'info@aurora-aset.co.id',
      website: 'www.aurora-aset.co.id',
      logo_url: ''
    };
  }
}

async function loadSignatureSettings() {
  try {
    const res = await api('/settings/signature');
    if (res && res.data) {
      state.signature = res.data;
    }
  } catch (e) {
    state.signature = {
      sign1_title: 'Direktur Operasional',
      sign1_name: 'Ir. H. Rahmat Hidayat',
      sign1_id: 'NIP. 19780512 200312 1 002',
      sign2_title: 'Pengelola Aset & Logistik',
      sign2_name: 'Ade Suharmin',
      sign2_id: 'NIP. 19850320 201001 1 015',
      sign_city: 'Bandung'
    };
  }
}

// App Entry Point (Protected with SSO Link & Login Enforcement)
async function initApp() {
  document.documentElement.setAttribute('data-theme', state.theme);
  await loadCompanyProfile();
  await loadSignatureSettings();

  // 1. Check if accessed via SSO link parameter (?sso_token=... or ?token=...)
  const urlParams = new URLSearchParams(window.location.search);
  const ssoToken = urlParams.get('sso_token') || urlParams.get('token');

  if (ssoToken) {
    try {
      showToast('Memverifikasi tautan SSO...', 'info');
      const res = await api('/auth/sso/verify?token=' + encodeURIComponent(ssoToken));
      if (res && res.token && res.user) {
        state.token = res.token;
        state.user = res.user;
        localStorage.setItem('assetcare_token', res.token);
        
        // Remove token from browser URL address bar to keep it clean
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        
        showToast(`Login via SSO berhasil! Selamat datang, ${res.user.name}`);
      }
    } catch (e) {
      showToast('Link SSO tidak valid atau sudah kedaluwarsa. Silakan login manual.', 'error');
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // 2. Validate existing session token in localStorage
  if (!state.user && state.token) {
    try {
      const res = await api('/auth/me');
      if (res && res.user) {
        state.user = res.user;
      }
    } catch (e) {
      state.token = '';
      state.user = null;
      localStorage.removeItem('assetcare_token');
    }
  }

  // 3. If authenticated, refresh cache master
  if (state.user && state.token) {
    await refreshMasterCache();
  }

  renderApp();
}

function renderApp() {
  const root = document.getElementById('app');
  // Mandatory check: if not authenticated, redirect to Login View
  if (!state.user || !state.token) {
    renderLoginView(root);
  } else {
    renderDashboardShell(root);
  }
}

async function logoutUser() {
  if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem('assetcare_token');
  state.token = '';
  state.user = null;
  showToast('Anda telah keluar dari sistem.');
  renderApp();
}

function switchLoginMode(mode) {
  const pwdForm = document.getElementById('login-form');
  const ssoForm = document.getElementById('login-sso-form');
  const pwdBtn = document.getElementById('tab-login-pwd-btn');
  const ssoBtn = document.getElementById('tab-login-sso-btn');

  if (mode === 'sso') {
    if (pwdForm) pwdForm.style.display = 'none';
    if (ssoForm) ssoForm.style.display = 'block';
    if (pwdBtn) pwdBtn.className = 'btn btn-sm btn-outline';
    if (ssoBtn) ssoBtn.className = 'btn btn-sm btn-primary';
  } else {
    if (pwdForm) pwdForm.style.display = 'block';
    if (ssoForm) ssoForm.style.display = 'none';
    if (pwdBtn) pwdBtn.className = 'btn btn-sm btn-primary';
    if (ssoBtn) ssoBtn.className = 'btn btn-sm btn-outline';
  }
}

// 1. LOGIN VIEW
function renderLoginView(container) {
  const appName = state.company?.app_name || 'Aurora Aset';
  const companyName = state.company?.company_name || 'PT Aurora Nusantara';
  const logoHtml = state.company?.logo_url 
    ? `<img src="${state.company.logo_url}" class="brand-logo-img" alt="Logo">`
    : `<div class="brand-badge">AA</div>`;

  container.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-brand">
          ${logoHtml}
          <div>
            <div class="brand-title">${appName}</div>
            <div class="brand-subtitle">${companyName.toUpperCase()}</div>
          </div>
        </div>

        <h1 class="login-title">Masuk ke Sistem</h1>
        <p class="login-desc">Sistem terproteksi. Silakan masuk menggunakan akun kredensial atau otorisasi Single Sign-On (SSO).</p>

        <!-- Login Tabs: Akun vs Token SSO -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <button type="button" id="tab-login-pwd-btn" class="btn btn-sm btn-primary" style="flex: 1;" onclick="switchLoginMode('pwd')">
            Masuk dengan Akun
          </button>
          <button type="button" id="tab-login-sso-btn" class="btn btn-sm btn-outline" style="flex: 1;" onclick="switchLoginMode('sso')">
            Gunakan Token SSO
          </button>
        </div>

        <!-- Form 1: Username & Password -->
        <form id="login-form">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Username</label>
            <input type="text" id="login-username" class="form-input" placeholder="Masukkan username" required value="admin">
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="Masukkan password" required value="Admin@12345">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px;">
            Masuk ke Ruang Kerja
          </button>
        </form>

        <!-- Form 2: SSO Token Input -->
        <form id="login-sso-form" style="display: none;">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Token atau Tautan SSO</label>
            <textarea id="login-sso-input" class="form-input mono" rows="3" placeholder="Tempel token SSO atau seluruh tautan URL di sini..." required></textarea>
            <span style="font-size: 11px; color: var(--text-subtle); margin-top: 4px; display: block;">
              Anda dapat memasukkan token langsung atau seluruh link URL SSO yang diberikan oleh administrator.
            </span>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px;">
            Masuk dengan SSO
          </button>
        </form>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span>Default: <span class="mono" style="color: var(--text-main);">admin</span> / <span class="mono" style="color: var(--text-main);">Admin@12345</span></span>
          <span style="color: #10B981; font-weight: 500;">● Otorisasi Aktif</span>
        </div>
      </div>
    </div>
  `;

  // Submit Password Form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;

    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: u, password: p })
      });

      state.token = res.token;
      state.user = res.user;
      localStorage.setItem('assetcare_token', res.token);
      showToast('Login berhasil. Selamat datang kembali!');
      await refreshMasterCache();
      renderApp();
    } catch (err) {
      // toast shown in api helper
    }
  });

  // Submit SSO Form
  document.getElementById('login-sso-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let raw = document.getElementById('login-sso-input').value.trim();
    if (!raw) return;

    // If whole URL pasted, extract sso_token parameter
    if (raw.includes('sso_token=')) {
      try {
        const u = new URL(raw.startsWith('http') ? raw : 'http://dummy/' + raw);
        raw = u.searchParams.get('sso_token') || raw;
      } catch (err) {}
    } else if (raw.includes('token=')) {
      try {
        const u = new URL(raw.startsWith('http') ? raw : 'http://dummy/' + raw);
        raw = u.searchParams.get('token') || raw;
      } catch (err) {}
    }

    try {
      showToast('Memverifikasi token SSO...', 'info');
      const res = await api('/auth/sso/verify?token=' + encodeURIComponent(raw));
      if (res && res.token && res.user) {
        state.token = res.token;
        state.user = res.user;
        localStorage.setItem('assetcare_token', res.token);
        showToast(`Login via SSO berhasil! Selamat datang, ${res.user.name}`);
        await refreshMasterCache();
        renderApp();
      }
    } catch (err) {
      showToast('Token SSO tidak valid atau sudah kedaluwarsa.', 'error');
    }
  });
}

// 2. MAIN SHELL
function renderDashboardShell(container) {
  const appName = state.company?.app_name || 'Aurora Aset';
  const companyName = state.company?.company_name || 'PT Aurora Nusantara';
  const logoHtml = state.company?.logo_url 
    ? `<img src="${state.company.logo_url}" class="brand-logo-img" alt="Logo">`
    : `<div class="brand-badge">AA</div>`;

  container.innerHTML = `
    <div class="app-shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-wrapper">
            ${logoHtml}
            <div>
              <div class="brand-title">${appName}</div>
              <div class="brand-subtitle">${companyName}</div>
            </div>
          </div>
        </div>

        <div class="nav-section-label">Navigasi Utama</div>
        <nav class="nav-menu">
          <a href="#" class="nav-item ${state.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
            ${icons.dashboard} <span>Dashboard</span>
          </a>
          <a href="#" class="nav-item ${state.activeTab === 'master' ? 'active' : ''}" data-tab="master">
            ${icons.master} <span>Master Data</span>
          </a>
          <a href="#" class="nav-item ${state.activeTab === 'assets' ? 'active' : ''}" data-tab="assets">
            ${icons.assets} <span>Data Aset</span>
          </a>
          <a href="#" class="nav-item ${state.activeTab === 'maintenance' ? 'active' : ''}" data-tab="maintenance">
            ${icons.maintenance} <span>Perawatan</span>
          </a>
          <a href="#" class="nav-item ${state.activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
            ${icons.reports} <span>Laporan</span>
          </a>
          <a href="#" class="nav-item ${state.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
            ${icons.settings} <span>Pengaturan & DB</span>
          </a>
          <a href="/docs" target="_blank" class="nav-item">
            ${icons.docs} <span>Dokumentasi API</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile-card" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
              <div class="user-avatar">${(state.user?.name || 'AD').substring(0, 2).toUpperCase()}</div>
              <div class="user-meta" style="overflow: hidden;">
                <div class="user-name" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${state.user?.name || 'Admin'}</div>
                <div class="user-role">${state.user?.role || 'admin'}</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="logoutUser()" title="Keluar dari Sistem" style="padding: 4px 8px; color: #EF4444; border-color: rgba(239, 68, 68, 0.35); flex-shrink: 0; display: flex; align-items: center; gap: 4px;">
              ${icons.logout} <span style="font-size: 11px;">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <header class="topbar">
          <div class="topbar-breadcrumbs">
            <span>${(state.company?.app_name || 'AURORA ASET').toUpperCase()}</span>
            <span>/</span>
            <span class="active" id="topbar-crumb-label">${getCrumbLabel(state.activeTab)}</span>
          </div>

          <div class="topbar-right">
            <button id="theme-toggle-btn" class="theme-toggle-btn" onclick="toggleTheme()" title="Beralih Mode Tampilan">
              ${state.theme === 'light' ? icons.moon : icons.sun}
              <span>${state.theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
            </button>
            <div class="db-status-pill">
              <span class="pulse-dot"></span>
              <span>SQLite Mode WAL : Sinkron</span>
            </div>
          </div>
        </header>

        <main class="content-area" id="tab-content-area">
          <div style="padding: 40px; text-align: center; color: var(--text-muted);">Memuat tampilan...</div>
        </main>
      </div>
    </div>
  `;

  // Attach Navigation Listeners
  container.querySelectorAll('.nav-item[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  loadCurrentTab();
}

function getCrumbLabel(tab) {
  const map = {
    dashboard: 'DASHBOARD OPERASIONAL',
    master: 'MASTER DATA REFERENSI',
    assets: 'INVENTARIS DATA ASET',
    maintenance: 'PEKERJAAN PERAWATAN',
    reports: 'LAPORAN & REKAPITULASI',
    settings: 'PENGATURAN & AKSES DATABASE'
  };
  return map[tab] || 'SISTEM';
}

function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.sidebar .nav-item[data-tab]').forEach(el => {
    if (el.getAttribute('data-tab') === tab) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  document.getElementById('topbar-crumb-label').innerText = getCrumbLabel(tab);
  loadCurrentTab();
}

function loadCurrentTab() {
  const area = document.getElementById('tab-content-area');
  if (state.activeTab === 'dashboard') renderDashboardTab(area);
  else if (state.activeTab === 'master') renderMasterTab(area);
  else if (state.activeTab === 'assets') renderAssetsTab(area);
  else if (state.activeTab === 'maintenance') renderMaintenanceTab(area);
  else if (state.activeTab === 'reports') renderReportsTab(area);
  else if (state.activeTab === 'settings') renderSettingsTab(area);
}

// ---------------------------------------------------------------------
// 3. TAB: DASHBOARD
// ---------------------------------------------------------------------
async function renderDashboardTab(container) {
  container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">Memuat ringkasan eksekutif...</div>`;

  try {
    const data = await api('/dashboard');
    const { kpis, condition_distribution, category_distribution, room_distribution, status_pipeline, recent_maintenance } = data;

    const totalAssets = kpis.total_assets || 77;
    const totalVal = kpis.total_value || 0;

    // Category colors
    const catColors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#0284C7'];

    container.innerHTML = `
      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="hero-banner-content">
          <h2>Selamat Datang di Aurora Aset, ${state.user.name}</h2>
          <p>Sistem Informasi Manajemen Inventaris & Pemeliharaan Aset PT. AURORA</p>
          <div class="hero-badge-row">
            <span class="hero-meta-pill">📅 Periode: Februari 2026</span>
            <span class="hero-meta-pill">🏢 PT. AURORA</span>
            <span class="hero-meta-pill" style="color: #34D399;">✓ 77 Unit Aset Tersinkronisasi</span>
            <span class="hero-meta-pill" style="color: #60A5FA;">💎 Valuasi: ${formatRupiah(totalVal)}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-outline" onclick="switchTab('reports')">
            ${icons.reports} Buka Laporan Resmi
          </button>
          <button class="btn btn-primary" onclick="openNewAssetModal()">
            ${icons.plus} Tambah Aset Baru
          </button>
        </div>
      </div>

      <!-- 4 Primary KPI Metrics -->
      <div class="kpi-row">
        <div class="kpi-card accent-blue">
          <div class="kpi-card-label">
            <span>Total Unit Aset</span>
            <span style="color: #60A5FA;">40 Jenis</span>
          </div>
          <div class="kpi-card-value">${totalAssets} Unit</div>
          <div class="kpi-card-footnote">Tercatat di ${kpis.room_count || 12} ruangan operasional</div>
        </div>

        <div class="kpi-card accent-sky">
          <div class="kpi-card-label">
            <span>Total Valuasi Aset</span>
            <span style="color: #38BDF8;">Akumulasi</span>
          </div>
          <div class="kpi-card-value" style="color: #60A5FA;">${formatRupiah(totalVal)}</div>
          <div class="kpi-card-footnote">100% Ekuitas Modal Sendiri PT. AURORA</div>
        </div>

        <div class="kpi-card accent-emerald">
          <div class="kpi-card-label">
            <span>Kondisi Fisik Prima</span>
            <span style="color: #34D399;">84,42%</span>
          </div>
          <div class="kpi-card-value" style="color: #34D399;">
            ${condition_distribution.find(c => c.name.toLowerCase().includes('baik'))?.count || 65} Unit
          </div>
          <div class="kpi-card-footnote">8 Butuh Servis, 4 Rusak Berat</div>
        </div>

        <div class="kpi-card accent-amber">
          <div class="kpi-card-label">
            <span>Realisasi Perawatan</span>
            <span style="color: #FBBF24;">2 Tiket</span>
          </div>
          <div class="kpi-card-value" style="color: #FBBF24;">${formatRupiah(kpis.total_maintenance_cost || 1250000)}</div>
          <div class="kpi-card-footnote">${kpis.completed_maintenance || 2} pekerjaan servis selesai</div>
        </div>
      </div>

      <!-- Interactive Proportion Bars Section -->
      <div class="grid-two-column">
        <!-- Komposisi Jenis Barang (Kategori) -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">${icons.master} Komposisi Kategori Aset</div>
            <button class="btn btn-outline btn-sm" onclick="switchTab('assets')">Lihat Data Aset</button>
          </div>
          <div class="panel-body">
            <!-- Segmented Bar -->
            <div class="segmented-bar-wrapper">
              <div class="segmented-bar-header">
                <span style="font-weight: 600;">Distribusi Unit Berdasarkan Jenis Barang</span>
                <span class="mono" style="color: var(--text-muted);">${totalAssets} Unit Total</span>
              </div>
              <div class="segmented-bar">
                ${category_distribution.map((cat, idx) => {
                  const pct = totalAssets > 0 ? ((cat.count / totalAssets) * 100).toFixed(1) : 0;
                  const color = catColors[idx % catColors.length];
                  return `<div class="segmented-bar-item" style="width: ${pct}%; background-color: ${color};" title="${cat.name}: ${cat.count} unit (${pct}%)"></div>`;
                }).join('')}
              </div>
            </div>

            <!-- Legend with interactive clicks -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
              ${category_distribution.map((cat, idx) => {
                const pct = totalAssets > 0 ? ((cat.count / totalAssets) * 100).toFixed(2) : '0.00';
                const color = catColors[idx % catColors.length];
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: 4px; font-size: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="legend-dot" style="background-color: ${color};"></span>
                      <span style="font-weight: 600;">${cat.name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <span class="mono" style="color: var(--text-muted);">${cat.count} Unit (${pct}%)</span>
                      <span class="mono" style="font-weight: 600; color: #60A5FA;">${formatRupiah(cat.total_value)}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Kesehatan & Kondisi Fisik Aset -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">${icons.reports} Kesehatan Fisik & Kesiapan Aset</div>
            <button class="btn btn-outline btn-sm" onclick="setReportTab('hal1'); switchTab('reports');">Lihat Rekap</button>
          </div>
          <div class="panel-body">
            <!-- Segmented Bar -->
            <div class="segmented-bar-wrapper">
              <div class="segmented-bar-header">
                <span style="font-weight: 600;">Status Kelayakan Operasional Aset</span>
                <span class="mono" style="color: var(--text-muted);">${totalAssets} Unit Total</span>
              </div>
              <div class="segmented-bar">
                ${condition_distribution.map(c => {
                  const pct = totalAssets > 0 ? ((c.count / totalAssets) * 100).toFixed(1) : 0;
                  const color = getConditionColor(c.name);
                  return `<div class="segmented-bar-item" style="width: ${pct}%; background-color: ${color};" title="${c.name}: ${c.count} unit (${pct}%)"></div>`;
                }).join('')}
              </div>
            </div>

            <!-- Legend with detailed health status -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
              ${condition_distribution.map(c => {
                const pct = totalAssets > 0 ? ((c.count / totalAssets) * 100).toFixed(2) : '0.00';
                const color = getConditionColor(c.name);
                let badgeClass = 'badge-baik';
                if (c.name.toLowerCase().includes('ringan') || c.name.toLowerCase().includes('perhatian')) badgeClass = 'badge-rusak-ringan';
                if (c.name.toLowerCase().includes('berat') || c.name.toLowerCase().includes('rusak') || c.name.toLowerCase().includes('afkir')) badgeClass = 'badge-rusak-berat';

                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: 4px; font-size: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="legend-dot" style="background-color: ${color};"></span>
                      <span class="badge ${badgeClass}">${c.name}</span>
                      <span class="mono" style="font-size: 11px; color: var(--text-subtle);">${c.level}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <span class="mono" style="font-weight: 600;">${c.count} Unit</span>
                      <span class="mono" style="color: var(--text-muted);">${pct}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Status Pipeline Bar -->
      <div style="margin-top: 4px; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
        Pipeline Alur Kerja Pemeliharaan Aset
      </div>
      <div class="pipeline-bar">
        ${status_pipeline.map(s => `
          <div class="pipeline-step ${state.maintStatusFilter === s.status ? 'active' : ''}" onclick="filterMaintFromDashboard('${s.status}')">
            <span class="pipeline-step-count">${s.count}</span>
            <span class="pipeline-step-label">${s.status}</span>
          </div>
        `).join('')}
      </div>

      <!-- Bottom Grids: Recent Maintenance & Top Locations -->
      <div class="grid-main-side">
        <!-- Recent Maintenance Table -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">${icons.maintenance} Catatan Pemeliharaan Terbaru</div>
            <button class="btn btn-outline btn-sm" onclick="switchTab('maintenance')">Semua Tiket</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>NO. TIKET</th>
                  <th>NAMA ASET</th>
                  <th>TANGGAL</th>
                  <th>STATUS</th>
                  <th style="text-align: right;">BIAYA (RP)</th>
                </tr>
              </thead>
              <tbody>
                ${recent_maintenance.length === 0 ? `
                  <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada riwayat perawatan.</td></tr>
                ` : recent_maintenance.map(m => `
                  <tr>
                    <td class="mono" style="color: #93C5FD; font-weight: 500;">
                      <span class="code-pill" onclick="copyToClipboard('${m.ticket_number}', 'Nomor Tiket')" title="Klik untuk salin">${m.ticket_number}</span>
                    </td>
                    <td>
                      <div style="font-weight: 600;">${m.asset_name}</div>
                      ${m.notes ? `<div style="font-size: 11px; color: var(--text-subtle);">${m.notes}</div>` : ''}
                    </td>
                    <td class="mono">${m.request_date}</td>
                    <td><span class="badge badge-${m.status.toLowerCase().replace(/ /g, '-')}">${m.status}</span></td>
                    <td class="mono" style="text-align: right; font-weight: 600; color: #60A5FA;">${formatRupiah(m.cost)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Rooms Breakdown -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">${icons.master} Sebaran Lokasi Aset Terbesar</div>
            <button class="btn btn-outline btn-sm" onclick="switchTab('master')">Master Lokasi</button>
          </div>
          <div class="panel-body">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(room_distribution || []).slice(0, 5).map((r, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-elevated); border-radius: 4px; font-size: 12px;">
                  <div>
                    <div style="font-weight: 600;">${r.name}</div>
                    <div style="font-size: 10px; color: var(--text-subtle);">${r.building || '-'} ${r.floor ? `(${r.floor})` : ''}</div>
                  </div>
                  <div style="text-align: right;">
                    <span class="badge badge-neutral">${r.count} Unit</span>
                    <div class="mono" style="font-size: 11px; color: #60A5FA; margin-top: 2px;">${formatRupiah(r.total_value)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Gagal memuat dashboard: ${err.message}</p><button class="btn btn-outline" onclick="loadCurrentTab()">Coba Lagi</button></div>`;
  }
}

function getConditionColor(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('baik')) return 'var(--success)';
  if (n.includes('ringan') || n.includes('perhatian')) return 'var(--warning)';
  if (n.includes('rusak') || n.includes('afkir')) return 'var(--danger)';
  return 'var(--primary)';
}

function filterMaintFromDashboard(status) {
  state.maintStatusFilter = status;
  switchTab('maintenance');
}

// ---------------------------------------------------------------------
// 4. TAB: MASTER DATA
// ---------------------------------------------------------------------
async function renderMasterTab(container) {
  const currentKind = state.masterTab;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-header-title">Master Data Referensi</h1>
        <p class="page-header-desc">Kelola referensi terstruktur yang menjadi standar klasifikasi aset dan perawatannya.</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="openMasterModal('${currentKind}')">
          ${icons.plus} Tambah ${getMasterLabel(currentKind)}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <button class="tab-btn ${currentKind === 'categories' ? 'active' : ''}" onclick="setMasterTab('categories')">Kategori</button>
      <button class="tab-btn ${currentKind === 'rooms' ? 'active' : ''}" onclick="setMasterTab('rooms')">Ruangan & Lokasi</button>
      <button class="tab-btn ${currentKind === 'conditions' ? 'active' : ''}" onclick="setMasterTab('conditions')">Kondisi</button>
      <button class="tab-btn ${currentKind === 'pics' ? 'active' : ''}" onclick="setMasterTab('pics')">Penanggung Jawab (PIC)</button>
    </div>

    <div class="panel">
      <div class="table-container" id="master-table-wrapper">
        <div style="padding: 32px; text-align: center; color: var(--text-muted);">Memuat data master...</div>
      </div>
    </div>
  `;

  loadMasterData(currentKind);
}

function setMasterTab(kind) {
  state.masterTab = kind;
  renderMasterTab(document.getElementById('tab-content-area'));
}

function getMasterLabel(kind) {
  const map = {
    categories: 'Kategori',
    rooms: 'Ruangan',
    conditions: 'Kondisi',
    pics: 'Penanggung Jawab'
  };
  return map[kind] || 'Data';
}

async function loadMasterData(kind) {
  const wrapper = document.getElementById('master-table-wrapper');
  try {
    const res = await api(`/master/${kind}`);
    const items = res.data || [];

    if (items.length === 0) {
      wrapper.innerHTML = `<div class="empty-state"><p>Belum ada data ${getMasterLabel(kind)}.</p></div>`;
      return;
    }

    let thead = '';
    let tbody = '';

    if (kind === 'categories') {
      thead = `<tr><th>KODE</th><th>NAMA KATEGORI</th><th>DESKRIPSI</th><th style="text-align: right;">AKSI</th></tr>`;
      tbody = items.map(x => `
        <tr>
          <td class="mono" style="color: #93C5FD;">${x.code}</td>
          <td style="font-weight: 600;">${x.name}</td>
          <td style="color: var(--text-muted);">${x.description || '-'}</td>
          <td style="text-align: right;">
            <button class="btn-icon" title="Edit" onclick='openMasterModal("categories", ${JSON.stringify(x)})'>${icons.edit}</button>
            <button class="btn-icon" title="Hapus" style="color: #F87171;" onclick='deleteMasterItem("categories", ${x.id})'>${icons.trash}</button>
          </td>
        </tr>
      `).join('');
    } else if (kind === 'rooms') {
      thead = `<tr><th>KODE</th><th>NAMA RUANGAN</th><th>GEDUNG</th><th>LANTAI</th><th>DESKRIPSI</th><th style="text-align: right;">AKSI</th></tr>`;
      tbody = items.map(x => `
        <tr>
          <td class="mono" style="color: #93C5FD;">${x.code}</td>
          <td style="font-weight: 600;">${x.name}</td>
          <td>${x.building || '-'}</td>
          <td class="mono">${x.floor || '-'}</td>
          <td style="color: var(--text-muted);">${x.description || '-'}</td>
          <td style="text-align: right;">
            <button class="btn-icon" title="Edit" onclick='openMasterModal("rooms", ${JSON.stringify(x)})'>${icons.edit}</button>
            <button class="btn-icon" title="Hapus" style="color: #F87171;" onclick='deleteMasterItem("rooms", ${x.id})'>${icons.trash}</button>
          </td>
        </tr>
      `).join('');
    } else if (kind === 'conditions') {
      thead = `<tr><th>KODE</th><th>NAMA KONDISI</th><th>LEVEL TINGKAT</th><th>DESKRIPSI</th><th style="text-align: right;">AKSI</th></tr>`;
      tbody = items.map(x => `
        <tr>
          <td class="mono" style="color: #93C5FD;">${x.code}</td>
          <td style="font-weight: 600;">${x.name}</td>
          <td><span class="badge badge-neutral">${x.level}</span></td>
          <td style="color: var(--text-muted);">${x.description || '-'}</td>
          <td style="text-align: right;">
            <button class="btn-icon" title="Edit" onclick='openMasterModal("conditions", ${JSON.stringify(x)})'>${icons.edit}</button>
            <button class="btn-icon" title="Hapus" style="color: #F87171;" onclick='deleteMasterItem("conditions", ${x.id})'>${icons.trash}</button>
          </td>
        </tr>
      `).join('');
    } else if (kind === 'pics') {
      thead = `<tr><th>KODE</th><th>NAMA PIC</th><th>NIP / ID</th><th>DEPARTEMEN / UNIT</th><th>KONTAK HP</th><th>EMAIL</th><th style="text-align: right;">AKSI</th></tr>`;
      tbody = items.map(x => `
        <tr>
          <td class="mono" style="color: #93C5FD;">${x.code}</td>
          <td style="font-weight: 600;">${x.name}</td>
          <td class="mono">${x.nip || '-'}</td>
          <td>${x.department || '-'}</td>
          <td class="mono">${x.phone || '-'}</td>
          <td style="color: var(--text-muted);">${x.email || '-'}</td>
          <td style="text-align: right;">
            <button class="btn-icon" title="Edit" onclick='openMasterModal("pics", ${JSON.stringify(x)})'>${icons.edit}</button>
            <button class="btn-icon" title="Hapus" style="color: #F87171;" onclick='deleteMasterItem("pics", ${x.id})'>${icons.trash}</button>
          </td>
        </tr>
      `).join('');
    }

    wrapper.innerHTML = `
      <table class="data-table">
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat master data: ${err.message}</p></div>`;
  }
}

function openMasterModal(kind, item = null) {
  const isEdit = !!item;
  const title = isEdit ? `Edit ${getMasterLabel(kind)}` : `Tambah ${getMasterLabel(kind)} Baru`;

  let extraFields = '';
  if (kind === 'rooms') {
    extraFields = `
      <div class="form-group">
        <label class="form-label">Gedung</label>
        <input type="text" id="m-building" class="form-input" value="${item ? (item.building || '') : ''}" placeholder="Contoh: Gedung Utama">
      </div>
      <div class="form-group">
        <label class="form-label">Lantai</label>
        <input type="text" id="m-floor" class="form-input" value="${item ? (item.floor || '') : ''}" placeholder="Contoh: Lantai 2">
      </div>
    `;
  } else if (kind === 'conditions') {
    extraFields = `
      <div class="form-group">
        <label class="form-label">Level Tingkat Kerusakan</label>
        <select id="m-level" class="form-select">
          <option value="BAIK" ${item && item.level === 'BAIK' ? 'selected' : ''}>BAIK</option>
          <option value="RUSAK_RINGAN" ${item && item.level === 'RUSAK_RINGAN' ? 'selected' : ''}>RUSAK RINGAN</option>
          <option value="RUSAK_BERAT" ${item && item.level === 'RUSAK_BERAT' ? 'selected' : ''}>RUSAK BERAT</option>
          <option value="AFKIR" ${item && item.level === 'AFKIR' ? 'selected' : ''}>AFKIR</option>
        </select>
      </div>
    `;
  } else if (kind === 'pics') {
    extraFields = `
      <div class="form-group">
        <label class="form-label">NIP / Identitas Pegawai</label>
        <input type="text" id="m-nip" class="form-input" value="${item ? (item.nip || '') : ''}" placeholder="Nomor Induk Pegawai">
      </div>
      <div class="form-group">
        <label class="form-label">Unit Kerja / Departemen</label>
        <input type="text" id="m-department" class="form-input" value="${item ? (item.department || '') : ''}" placeholder="Divisi atau Bagian">
      </div>
      <div class="form-group">
        <label class="form-label">Nomor Handphone / WhatsApp</label>
        <input type="text" id="m-phone" class="form-input" value="${item ? (item.phone || '') : ''}" placeholder="08xxxxxxxxxx">
      </div>
      <div class="form-group">
        <label class="form-label">Alamat Email</label>
        <input type="email" id="m-email" class="form-input" value="${item ? (item.email || '') : ''}" placeholder="nama@instansi.go.id">
      </div>
    `;
  }

  const modalHtml = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form id="master-form">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Kode Referensi <span class="req">*</span></label>
              <input type="text" id="m-code" class="form-input mono" required value="${item ? item.code : ''}" placeholder="Contoh: K-01">
            </div>
            <div class="form-group">
              <label class="form-label">Nama <span class="req">*</span></label>
              <input type="text" id="m-name" class="form-input" required value="${item ? item.name : ''}" placeholder="Masukkan nama">
            </div>
            ${extraFields}
            <div class="form-group full">
              <label class="form-label">Deskripsi / Keterangan Tambahan</label>
              <textarea id="m-description" class="form-textarea" placeholder="Catatan informasi tambahan...">${item ? (item.description || '') : ''}</textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Master</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml, (modal) => {
    modal.querySelector('#master-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        code: modal.querySelector('#m-code').value.trim(),
        name: modal.querySelector('#m-name').value.trim(),
        description: modal.querySelector('#m-description').value.trim()
      };

      if (kind === 'rooms') {
        payload.building = modal.querySelector('#m-building').value.trim();
        payload.floor = modal.querySelector('#m-floor').value.trim();
      } else if (kind === 'conditions') {
        payload.level = modal.querySelector('#m-level').value;
      } else if (kind === 'pics') {
        payload.nip = modal.querySelector('#m-nip').value.trim();
        payload.department = modal.querySelector('#m-department').value.trim();
        payload.phone = modal.querySelector('#m-phone').value.trim();
        payload.email = modal.querySelector('#m-email').value.trim();
      }

      try {
        if (isEdit) {
          await api(`/master/${kind}/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
          showToast(`Master ${getMasterLabel(kind)} berhasil diperbarui.`);
        } else {
          await api(`/master/${kind}`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          showToast(`Master ${getMasterLabel(kind)} berhasil ditambahkan.`);
        }
        closeModal();
        await refreshMasterCache();
        loadMasterData(kind);
      } catch (err) {
        // error handled
      }
    });
  });
}

async function deleteMasterItem(kind, id) {
  if (!confirm(`Konfirmasi: Anda yakin ingin menghapus data master ${getMasterLabel(kind)} ini?`)) {
    return;
  }

  try {
    await api(`/master/${kind}/${id}`, { method: 'DELETE' });
    showToast('Data master berhasil dihapus.');
    await refreshMasterCache();
    loadMasterData(kind);
  } catch (err) {
    // error handled
  }
}

// ---------------------------------------------------------------------
// 5. TAB: ASSETS INVENTORY
// ---------------------------------------------------------------------
async function renderAssetsTab(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-header-title">Inventaris Data Aset</h1>
        <p class="page-header-desc">Katalog terinci seluruh 77 aset PT. AURORA, lokasi ruangan, kondisi kelayakan, dan penanggung jawab.</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-outline" onclick="exportAssetsCsv()">
          ${icons.download} Ekspor CSV
        </button>
        <button class="btn btn-outline" onclick="openImportAssetsModal()">
          ${icons.upload} Impor CSV
        </button>
        <button class="btn btn-primary" onclick="openNewAssetModal()">
          ${icons.plus} Tambah Aset Baru
        </button>
      </div>
    </div>

    <!-- Quick Filter Chips: Categories -->
    <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
      <div class="filter-chip-group" id="category-chip-group">
        <span class="filter-chip ${state.assetCatFilter === '' ? 'active' : ''}" onclick="setAssetCatFilter('')">
          Semua Kategori (77)
        </span>
        ${state.cache.categories.map(c => `
          <span class="filter-chip ${state.assetCatFilter == c.id ? 'active' : ''}" onclick="setAssetCatFilter('${c.id}')">
            ${c.name}
          </span>
        `).join('')}
      </div>

      <!-- Condition Quick Filter Chips -->
      <div class="filter-chip-group" id="condition-chip-group">
        <span class="filter-chip ${state.assetCondFilter === '' ? 'active' : ''}" onclick="setAssetCondFilter('')">
          Semua Kondisi
        </span>
        ${state.cache.conditions.map(c => `
          <span class="filter-chip ${state.assetCondFilter == c.id ? 'active' : ''}" onclick="setAssetCondFilter('${c.id}')">
            ${c.name}
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Search & Room Filter Toolbar -->
    <div class="toolbar-row">
      <div class="toolbar-left">
        <div class="search-input-wrapper">
          ${icons.search}
          <input type="text" id="asset-search-input" placeholder="Cari nama, kode, lokasi, atau penanggung jawab..." value="${state.assetSearch}">
          ${state.assetSearch ? `<button style="color: var(--text-muted); padding: 0 4px;" onclick="clearAssetSearch()">✕</button>` : ''}
        </div>

        <select id="asset-room-filter" class="filter-select">
          <option value="">Semua Lokasi / Ruangan</option>
          ${state.cache.rooms.map(r => `<option value="${r.id}" ${state.assetRoomFilter == r.id ? 'selected' : ''}>${r.name} (${r.floor || ''})</option>`).join('')}
        </select>

        ${(state.assetSearch || state.assetCatFilter || state.assetRoomFilter || state.assetCondFilter) ? `
          <button class="btn btn-outline btn-sm" onclick="resetAssetFilters()" style="color: var(--warning);">
            Reset Filter
          </button>
        ` : ''}
      </div>

      <div class="toolbar-right">
        <span id="asset-count-indicator" class="mono" style="font-size: 11px; color: var(--text-muted);">Memuat...</span>
      </div>
    </div>

    <!-- Assets Table Container -->
    <div class="panel">
      <div class="table-container" id="assets-table-wrapper">
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">Memuat data inventaris aset...</div>
      </div>
    </div>
  `;

  // Attach Filter Listeners
  const searchInput = document.getElementById('asset-search-input');
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.assetSearch = e.target.value;
      loadAssetsList();
    }, 200);
  });

  document.getElementById('asset-room-filter').addEventListener('change', (e) => {
    state.assetRoomFilter = e.target.value;
    loadAssetsList();
  });

  loadAssetsList();
}

function setAssetCatFilter(catId) {
  state.assetCatFilter = catId;
  renderAssetsTab(document.getElementById('tab-content-area'));
}

function setAssetCondFilter(condId) {
  state.assetCondFilter = condId;
  renderAssetsTab(document.getElementById('tab-content-area'));
}

function clearAssetSearch() {
  state.assetSearch = '';
  renderAssetsTab(document.getElementById('tab-content-area'));
}

async function loadAssetsList() {
  const wrapper = document.getElementById('assets-table-wrapper');
  const countIndicator = document.getElementById('asset-count-indicator');

  const params = new URLSearchParams();
  if (state.assetSearch) params.append('search', state.assetSearch);
  if (state.assetCatFilter) params.append('category_id', state.assetCatFilter);
  if (state.assetRoomFilter) params.append('room_id', state.assetRoomFilter);
  if (state.assetCondFilter) params.append('condition_id', state.assetCondFilter);

  try {
    const res = await api(`/assets?${params.toString()}`);
    const items = res.data || [];

    const totalFilterVal = items.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalFilterQty = items.reduce((sum, a) => sum + (a.quantity || 1), 0);

    if (countIndicator) {
      countIndicator.innerText = `${items.length} ASET TERFILTER | VALUASI: ${formatRupiah(totalFilterVal)}`;
    }

    if (items.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada aset yang sesuai kriteria pencarian / filter.</p>
          <button class="btn btn-outline btn-sm" onclick="resetAssetFilters()">Reset Semua Filter</button>
        </div>
      `;
      return;
    }

    wrapper.innerHTML = `
      <table class="data-table" style="font-size: 11px;">
        <thead>
          <tr>
            <th style="width: 36px; text-align: center;">NO</th>
            <th>NAMA ASET</th>
            <th>KODE ASET</th>
            <th style="text-align: center;">JUMLAH</th>
            <th>JENIS BARANG</th>
            <th>EQUITAS</th>
            <th>LOKASI RUANGAN</th>
            <th style="text-align: center;">KONDISI</th>
            <th style="text-align: right;">NILAI PEROLEHAN</th>
            <th style="text-align: right; width: 100px;">AKSI</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(a => {
            const cond = (a.condition_name || '').toLowerCase();
            let badgeClass = 'badge-baik';
            if (cond.includes('rusak berat') || cond.includes('rusak parah') || cond.includes('afkir')) {
              badgeClass = 'badge-rusak-berat';
            } else if (cond.includes('rusak') || cond.includes('perhatian') || cond.includes('ringan')) {
              badgeClass = 'badge-rusak-ringan';
            }

            return `
              <tr>
                <td class="mono" style="text-align: center; color: var(--text-muted);">${a.item_no || a.id}</td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 12px;">${a.name}</div>
                  ${a.notes ? `<div style="font-size: 10px; color: var(--text-subtle); margin-top: 2px;">${a.notes}</div>` : ''}
                </td>
                <td>
                  ${a.code ? `
                    <span class="code-pill" onclick="copyToClipboard('${a.code}', 'Kode Aset')" title="Klik untuk salin">
                      ${icons.copy} ${a.code}
                    </span>
                  ` : `<span style="color: var(--text-subtle);">-</span>`}
                </td>
                <td class="mono" style="text-align: center;">${a.quantity || 1} Buah</td>
                <td><span style="font-weight: 500;">${a.category_name || '-'}</span></td>
                <td class="mono" style="color: var(--text-muted);">${a.equity || 'AURORA'}</td>
                <td>
                  <div style="font-weight: 500;">${a.room_name || '-'}</div>
                  ${a.room_floor ? `<div style="font-size: 10px; color: var(--text-subtle);">${a.room_floor}</div>` : ''}
                </td>
                <td style="text-align: center;">
                  <span class="badge ${badgeClass}">${a.condition_name}</span>
                </td>
                <td class="mono" style="text-align: right; font-weight: 600; color: #60A5FA;">
                  ${formatRupiah(a.value)}
                </td>
                <td style="text-align: right; white-space: nowrap;">
                  <button class="btn-icon" title="Lihat Histori & Detail" onclick="viewAssetDetail(${a.id})">${icons.eye}</button>
                  <button class="btn-icon" title="Edit Data Aset" onclick='openEditAssetModal(${JSON.stringify(a).replace(/'/g, "&#39;")})'>${icons.edit}</button>
                  <button class="btn-icon" title="Hapus Aset" style="color: #F87171;" onclick="deleteAssetItem(${a.id}, '${a.code || a.name}')">${icons.trash}</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight: 700; background: var(--bg-surface-elevated);">
            <td colspan="3" style="text-align: right;">TOTAL TERFILTER (${items.length} ASET):</td>
            <td class="mono" style="text-align: center;">${totalFilterQty} Buah</td>
            <td colspan="4"></td>
            <td class="mono" style="text-align: right; color: #60A5FA; font-size: 13px;">${formatRupiah(totalFilterVal)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat aset: ${err.message}</p></div>`;
  }
}

function resetAssetFilters() {
  state.assetSearch = '';
  state.assetCatFilter = '';
  state.assetRoomFilter = '';
  state.assetCondFilter = '';
  renderAssetsTab(document.getElementById('tab-content-area'));
}

function openNewAssetModal() {
  const modalHtml = `
    <div class="modal-dialog wide">
      <div class="modal-header">
        <div class="modal-title">Pencatatan Data Aset Baru</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form id="asset-form">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Kode Aset <span class="req">*</span></label>
              <input type="text" id="ast-code" class="form-input mono" required placeholder="Contoh: AST-2026-001">
            </div>

            <div class="form-group">
              <label class="form-label">Nama Aset <span class="req">*</span></label>
              <input type="text" id="ast-name" class="form-input" required placeholder="Contoh: Laptop ThinkPad T14">
            </div>

            <div class="form-group">
              <label class="form-label">Kategori Aset <span class="req">*</span></label>
              <select id="ast-category" class="form-select" required>
                <option value="">Pilih Kategori</option>
                ${state.cache.categories.map(c => `<option value="${c.id}">${c.code} : ${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ruangan & Lokasi <span class="req">*</span></label>
              <select id="ast-room" class="form-select" required>
                <option value="">Pilih Ruangan</option>
                ${state.cache.rooms.map(r => `<option value="${r.id}">${r.code} : ${r.name} (${r.floor || ''})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Kondisi Aset <span class="req">*</span></label>
              <select id="ast-condition" class="form-select" required>
                ${state.cache.conditions.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Penanggung Jawab (PIC) <span class="req">*</span></label>
              <select id="ast-pic" class="form-select" required>
                <option value="">Pilih Penanggung Jawab</option>
                ${state.cache.pics.map(p => `<option value="${p.id}">${p.name} (${p.department || ''})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Nilai / Harga Perolehan (Rp)</label>
              <input type="number" id="ast-value" class="form-input mono" placeholder="0" value="0">
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Beli / Perolehan <span class="req">*</span></label>
              <input type="date" id="ast-date" class="form-input mono" required value="${new Date().toISOString().slice(0, 10)}">
            </div>

            <div class="form-group full">
              <label class="form-label">Catatan Spesifikasi / Serial Number</label>
              <textarea id="ast-notes" class="form-textarea" placeholder="Catatan spesifikasi, nomor seri, garansi..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Aset</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml, (modal) => {
    modal.querySelector('#asset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        code: modal.querySelector('#ast-code').value.trim(),
        name: modal.querySelector('#ast-name').value.trim(),
        category_id: modal.querySelector('#ast-category').value,
        room_id: modal.querySelector('#ast-room').value,
        condition_id: modal.querySelector('#ast-condition').value,
        pic_id: modal.querySelector('#ast-pic').value,
        value: modal.querySelector('#ast-value').value,
        purchase_date: modal.querySelector('#ast-date').value,
        notes: modal.querySelector('#ast-notes').value.trim()
      };

      try {
        await api('/assets', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Aset baru berhasil disimpan.');
        closeModal();
        if (state.activeTab === 'assets') loadAssetsList();
        else switchTab('assets');
      } catch (err) {}
    });
  });
}

function openEditAssetModal(asset) {
  const modalHtml = `
    <div class="modal-dialog wide">
      <div class="modal-header">
        <div class="modal-title">Edit Data Aset : ${asset.code}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form id="edit-asset-form">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Kode Aset <span class="req">*</span></label>
              <input type="text" id="east-code" class="form-input mono" required value="${asset.code}">
            </div>

            <div class="form-group">
              <label class="form-label">Nama Aset <span class="req">*</span></label>
              <input type="text" id="east-name" class="form-input" required value="${asset.name}">
            </div>

            <div class="form-group">
              <label class="form-label">Kategori Aset <span class="req">*</span></label>
              <select id="east-category" class="form-select" required>
                ${state.cache.categories.map(c => `<option value="${c.id}" ${c.id === asset.category_id ? 'selected' : ''}>${c.code} : ${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ruangan & Lokasi <span class="req">*</span></label>
              <select id="east-room" class="form-select" required>
                ${state.cache.rooms.map(r => `<option value="${r.id}" ${r.id === asset.room_id ? 'selected' : ''}>${r.code} : ${r.name} (${r.floor || ''})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Kondisi Aset <span class="req">*</span></label>
              <select id="east-condition" class="form-select" required>
                ${state.cache.conditions.map(c => `<option value="${c.id}" ${c.id === asset.condition_id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Penanggung Jawab (PIC) <span class="req">*</span></label>
              <select id="east-pic" class="form-select" required>
                ${state.cache.pics.map(p => `<option value="${p.id}" ${p.id === asset.pic_id ? 'selected' : ''}>${p.name} (${p.department || ''})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Nilai / Harga Perolehan (Rp)</label>
              <input type="number" id="east-value" class="form-input mono" value="${asset.value}">
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Beli / Perolehan <span class="req">*</span></label>
              <input type="date" id="east-date" class="form-input mono" required value="${asset.purchase_date}">
            </div>

            <div class="form-group full">
              <label class="form-label">Catatan Spesifikasi / Serial Number</label>
              <textarea id="east-notes" class="form-textarea">${asset.notes || ''}</textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml, (modal) => {
    modal.querySelector('#edit-asset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        code: modal.querySelector('#east-code').value.trim(),
        name: modal.querySelector('#east-name').value.trim(),
        category_id: modal.querySelector('#east-category').value,
        room_id: modal.querySelector('#east-room').value,
        condition_id: modal.querySelector('#east-condition').value,
        pic_id: modal.querySelector('#east-pic').value,
        value: modal.querySelector('#east-value').value,
        purchase_date: modal.querySelector('#east-date').value,
        notes: modal.querySelector('#east-notes').value.trim()
      };

      try {
        await api(`/assets/${asset.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Data aset berhasil diperbarui.');
        closeModal();
        loadAssetsList();
      } catch (err) {}
    });
  });
}

async function viewAssetDetail(id) {
  try {
    const res = await api(`/assets/${id}`);
    const asset = res.data;
    const history = asset.maintenance_history || [];

    const modalHtml = `
      <div class="modal-dialog wide">
        <div class="modal-header">
          <div class="modal-title">Kartu Riwayat Aset : ${asset.code}</div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 6px; padding: 18px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div>
                <h2 style="font-size: 18px; font-weight: 700;">${asset.name}</h2>
                <div class="mono" style="color: #93C5FD; font-size: 12px; margin-top: 2px;">${asset.code}</div>
              </div>
              <span class="badge badge-${(asset.condition_name || '').toLowerCase().replace(/ /g, '-')}">
                ${asset.condition_name}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; font-size: 12px;">
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">KATEGORI</span>
                <b>${asset.category_name}</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">JUMLAH UNIT</span>
                <b>${asset.quantity || 1} Buah</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">EQUITAS</span>
                <b class="mono">${asset.equity || 'AURORA'}</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">LOKASI RUANGAN</span>
                <b>${asset.room_name} (${asset.room_floor || ''})</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">PENANGGUNG JAWAB</span>
                <b>${asset.pic_name}</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">NILAI PEROLEHAN</span>
                <b class="mono" style="color: #60A5FA;">${formatRupiah(asset.value)}</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">TANGGAL BELI</span>
                <b class="mono">${asset.purchase_date}</b>
              </div>
              <div>
                <span style="color: var(--text-subtle); display: block; font-size: 10px; font-family: var(--font-mono);">TOTAL BIAYA PERAWATAN</span>
                <b class="mono" style="color: #34D399;">${formatRupiah(asset.total_maintenance_cost)}</b>
              </div>
            </div>

            ${asset.notes ? `
              <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
                Catatan : ${asset.notes}
              </div>
            ` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-weight: 600; font-size: 13px;">Riwayat Tiket Perawatan (${history.length})</div>
            <button class="btn btn-outline btn-sm" onclick="closeModal(); openNewMaintenanceModal(${asset.id})">
              ${icons.plus} Ajukan Perawatan
            </button>
          </div>

          <div class="table-container" style="border: 1px solid var(--border-color); border-radius: 4px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>TIKET</th>
                  <th>TGL PERMINTAAN</th>
                  <th>STATUS</th>
                  <th>JADWAL / SELESAI</th>
                  <th>TEKNISI</th>
                  <th>BIAYA</th>
                  <th>CATATAN</th>
                </tr>
              </thead>
              <tbody>
                ${history.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">Belum ada riwayat perbaikan untuk aset ini.</td></tr>
                ` : history.map(h => `
                  <tr>
                    <td class="mono" style="color: #93C5FD;">${h.ticket_number}</td>
                    <td class="mono">${h.request_date}</td>
                    <td><span class="badge badge-${h.status.toLowerCase().replace(/ /g, '-')}">${h.status}</span></td>
                    <td class="mono">${h.scheduled_date || '-'} ${h.completion_date ? `/ ${h.completion_date}` : ''}</td>
                    <td>${h.technician || '-'}</td>
                    <td class="mono">${formatRupiah(h.cost)}</td>
                    <td style="color: var(--text-muted); font-size: 11px;">${h.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="closeModal()">Tutup</button>
        </div>
      </div>
    `;

    openModal(modalHtml);
  } catch (err) {}
}

async function deleteAssetItem(id, code) {
  if (!confirm(`Konfirmasi: Anda yakin ingin menghapus data aset '${code}'? Seluruh riwayat perawatan terkait juga akan dihapus.`)) {
    return;
  }

  try {
    await api(`/assets/${id}`, { method: 'DELETE' });
    showToast(`Aset '${code}' berhasil dihapus.`);
    loadAssetsList();
  } catch (err) {}
}

function exportAssetsCsv() {
  window.open('/api/assets/export/csv', '_blank');
}

function openImportAssetsModal() {
  const modalHtml = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">Impor Data Aset via CSV</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form id="import-csv-form">
        <div class="modal-body">
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
            Unggah file CSV dengan kolom standar: <b>Kode Aset, Nama Aset, Kategori, Ruangan, Kondisi, Nilai Perolehan, Tanggal Beli, Penanggung Jawab, Catatan</b>. Sistem akan secara otomatis memetakan ke master data terkait.
          </p>

          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Pilih File CSV</label>
            <input type="file" id="csv-file-input" class="form-input" accept=".csv" required>
          </div>

          <div style="background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: 4px; padding: 12px; font-size: 11px; color: var(--text-subtle);">
            Tip: Anda dapat mengklik tombol <b>Ekspor CSV</b> terlebih dahulu untuk mendapatkan contoh format header yang valid.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Proses Impor</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml, (modal) => {
    modal.querySelector('#import-csv-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = modal.querySelector('#csv-file-input');
      if (!fileInput.files || !fileInput.files[0]) return;

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      try {
        const res = await api('/assets/import/csv', {
          method: 'POST',
          body: formData
        });
        showToast(res.message);
        closeModal();
        loadAssetsList();
      } catch (err) {}
    });
  });
}

// ---------------------------------------------------------------------
// 6. TAB: MAINTENANCE WORKFLOW
// ---------------------------------------------------------------------
async function renderMaintenanceTab(container) {
  const currentStatus = state.maintStatusFilter;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-header-title">Pekerjaan & Alur Perawatan</h1>
        <p class="page-header-desc">Alur operasional 5 tahap : Permintaan, Penjadwalan, Pelaksanaan, Penyelesaian, dan Pembatalan.</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-outline" onclick="exportMaintenanceCsv()">
          ${icons.download} Ekspor CSV
        </button>
        <button class="btn btn-primary" onclick="openNewMaintenanceModal()">
          ${icons.plus} Buat Permintaan Perawatan
        </button>
      </div>
    </div>

    <!-- Status Tabs Pipeline -->
    <div class="tabs-wrapper">
      ${['Semua', 'Permintaan', 'Dijadwalkan', 'Dilaksanakan', 'Selesai', 'Dibatalkan'].map(st => `
        <button class="tab-btn ${currentStatus === st ? 'active' : ''}" onclick="setMaintStatusFilter('${st}')">
          ${st}
        </button>
      `).join('')}
    </div>

    <!-- Maintenance Table Panel -->
    <div class="panel">
      <div class="table-container" id="maint-table-wrapper">
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">Memuat tiket perawatan...</div>
      </div>
    </div>
  `;

  loadMaintenanceList();
}

function setMaintStatusFilter(status) {
  state.maintStatusFilter = status;
  renderMaintenanceTab(document.getElementById('tab-content-area'));
}

async function loadMaintenanceList() {
  const wrapper = document.getElementById('maint-table-wrapper');
  const params = new URLSearchParams();
  if (state.maintStatusFilter && state.maintStatusFilter !== 'Semua') {
    params.append('status', state.maintStatusFilter);
  }

  try {
    const res = await api(`/maintenance?${params.toString()}`);
    const items = res.data || [];

    if (items.length === 0) {
      wrapper.innerHTML = `<div class="empty-state"><p>Tidak ada tiket perawatan dalam status '${state.maintStatusFilter}'.</p></div>`;
      return;
    }

    wrapper.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>NOMOR TIKET</th>
            <th>ASET</th>
            <th>LOKASI</th>
            <th>TGL PERMINTAAN</th>
            <th>STATUS</th>
            <th>JADWAL PELAKSANAAN</th>
            <th>TEKNISI / VENDOR</th>
            <th>BIAYA REALISASI</th>
            <th style="text-align: right;">AKSI</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(m => `
            <tr>
              <td class="mono" style="color: #93C5FD; font-weight: 500;">${m.ticket_number}</td>
              <td>
                <div style="font-weight: 600;">${m.asset_name}</div>
                <div class="mono" style="font-size: 11px; color: var(--text-subtle);">${m.asset_code}</div>
              </td>
              <td>${m.room_name || '-'}</td>
              <td class="mono">${m.request_date}</td>
              <td>
                <span class="badge badge-${m.status.toLowerCase().replace(/ /g, '-')}">
                  ${m.status}
                </span>
              </td>
              <td class="mono">
                <div>${m.scheduled_date ? m.scheduled_date : '-'}</div>
                ${m.completion_date ? `<div style="font-size: 10px; color: var(--success);">Selesai: ${m.completion_date}</div>` : ''}
              </td>
              <td>${m.technician || '-'}</td>
              <td class="mono" style="font-weight: 600;">${formatRupiah(m.cost)}</td>
              <td style="text-align: right; white-space: nowrap;">
                <button class="btn btn-primary btn-sm" onclick='openUpdateMaintenanceModal(${JSON.stringify(m).replace(/'/g, "&#39;")})'>
                  ${icons.edit} Kelola Tiket
                </button>
                <button class="btn-icon" title="Hapus Tiket" style="color: #F87171; margin-left: 4px;" onclick="deleteMaintenanceItem(${m.id}, '${m.ticket_number}')">
                  ${icons.trash}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat tiket perawatan: ${err.message}</p></div>`;
  }
}

async function openNewMaintenanceModal(defaultAssetId = null) {
  // Fetch assets list for select
  let assets = [];
  try {
    const res = await api('/assets');
    assets = res.data || [];
  } catch (e) {}

  const modalHtml = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title">Buat Permintaan Perawatan Baru</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form id="new-maint-form">
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full">
              <label class="form-label">Pilih Unit Aset <span class="req">*</span></label>
              <select id="nm-asset" class="form-select" required>
                <option value="">Pilih Aset yang Bermasalah</option>
                ${assets.map(a => `<option value="${a.id}" ${defaultAssetId == a.id ? 'selected' : ''}>${a.code} : ${a.name} (${a.room_name})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Permintaan <span class="req">*</span></label>
              <input type="date" id="nm-date" class="form-input mono" required value="${new Date().toISOString().slice(0, 10)}">
            </div>

            <div class="form-group">
              <label class="form-label">Ubah Status Kondisi Aset Saat Ini</label>
              <select id="nm-condition" class="form-select">
                <option value="">Jangan Ubah Kondisi</option>
                ${state.cache.conditions.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group full">
              <label class="form-label">Keterangan Kerusakan / Keluhan</label>
              <textarea id="nm-notes" class="form-textarea" required placeholder="Jelaskan kendala, gejala kerusakan, atau kebutuhan perbaikan..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Permintaan</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml, (modal) => {
    modal.querySelector('#new-maint-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        asset_id: modal.querySelector('#nm-asset').value,
        request_date: modal.querySelector('#nm-date').value,
        status: 'Permintaan',
        notes: modal.querySelector('#nm-notes').value.trim(),
        set_asset_condition_id: modal.querySelector('#nm-condition').value || null
      };

      try {
        const res = await api('/maintenance', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast(res.message);
        closeModal();
        if (state.activeTab === 'maintenance') loadMaintenanceList();
        else switchTab('maintenance');
      } catch (err) {}
    });
  });
}

function openUpdateMaintenanceModal(item) {
  const modalHtml = `
    <div class="modal-dialog wide">
      <div class="modal-header">
        <div class="modal-title">Kelola Tiket Perawatan : ${item.ticket_number}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form id="update-maint-form">
        <div class="modal-body">
          <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 4px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px;">
            <b>${item.asset_name}</b> <span class="mono" style="color: #93C5FD;">(${item.asset_code})</span> | Ruangan : <b>${item.room_name}</b> | Tanggal Permintaan : <b>${item.request_date}</b>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Status Alur Perawatan <span class="req">*</span></label>
              <select id="um-status" class="form-select" required>
                ${['Permintaan', 'Dijadwalkan', 'Dilaksanakan', 'Selesai', 'Dibatalkan'].map(st => `
                  <option value="${st}" ${item.status === st ? 'selected' : ''}>${st}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Penjadwalan</label>
              <input type="date" id="um-scheduled" class="form-input mono" value="${item.scheduled_date || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Teknisi / Bengkel / Vendor</label>
              <input type="text" id="um-technician" class="form-input" value="${item.technician || ''}" placeholder="Nama teknisi internal atau vendor rekanan">
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Penyelesaian (Jika Selesai)</label>
              <input type="date" id="um-completion" class="form-input mono" value="${item.completion_date || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Realisasi Biaya Perawatan (Rp)</label>
              <input type="number" id="um-cost" class="form-input mono" value="${item.cost || 0}">
            </div>

            <div class="form-group">
              <label class="form-label">Update Kondisi Aset Setelah Servis</label>
              <select id="um-result-condition" class="form-select">
                <option value="">Biarkan Kondisi Saat Ini</option>
                ${state.cache.conditions.map(c => `
                  <option value="${c.id}" ${item.result_condition_id === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group full">
              <label class="form-label">Catatan Tindakan / Deskripsi Hasil Pekerjaan</label>
              <textarea id="um-notes" class="form-textarea" placeholder="Detail pergantian sparepart, tindakan teknis, atau alasan pembatalan...">${item.notes || ''}</textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Progres Tiket</button>
        </div>
      </form>
    </div>
  `;

  openModal(modalHtml, (modal) => {
    modal.querySelector('#update-maint-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        status: modal.querySelector('#um-status').value,
        scheduled_date: modal.querySelector('#um-scheduled').value,
        completion_date: modal.querySelector('#um-completion').value,
        technician: modal.querySelector('#um-technician').value.trim(),
        cost: modal.querySelector('#um-cost').value,
        result_condition_id: modal.querySelector('#um-result-condition').value || null,
        notes: modal.querySelector('#um-notes').value.trim()
      };

      try {
        const res = await api(`/maintenance/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast(res.message);
        closeModal();
        loadMaintenanceList();
      } catch (err) {}
    });
  });
}

async function deleteMaintenanceItem(id, ticket) {
  if (!confirm(`Konfirmasi: Anda yakin ingin menghapus tiket perawatan ${ticket}?`)) return;
  try {
    await api(`/maintenance/${id}`, { method: 'DELETE' });
    showToast(`Tiket ${ticket} berhasil dihapus.`);
    loadMaintenanceList();
  } catch (err) {}
}

function exportMaintenanceCsv() {
  window.open('/api/maintenance/export/csv', '_blank');
}

// ---------------------------------------------------------------------
// 7. TAB: REPORTS & ANALYTICS (AURORA ASET)
// ---------------------------------------------------------------------
let currentDetailSubPage = 'all';

async function renderReportsTab(container) {
  let currentTab = state.reportTab || 'rekap';
  if (currentTab === 'hal1') currentTab = 'rekap';
  if (currentTab === 'hal2_4') currentTab = 'detail';
  if (currentTab === 'hal5') currentTab = 'maint';
  if (currentTab === 'all') currentTab = 'konsolidasi';
  if (!['rekap', 'detail', 'maint', 'konsolidasi'].includes(currentTab)) {
    currentTab = 'rekap';
  }
  state.reportTab = currentTab;

  container.innerHTML = `
    <div class="page-header no-print" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
      <!-- Dropdown Konsolidasi Laporan -->
      <div style="display: flex; align-items: center; gap: 12px; flex: 1; max-width: 480px;">
        <label for="report-select-dropdown" style="font-weight: 700; font-size: 13px; color: var(--text-main); white-space: nowrap;">
          Pilih Dokumen Laporan:
        </label>
        <select id="report-select-dropdown" class="form-control" style="font-weight: 600; padding: 9px 14px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); color: var(--text-main); border: 1px solid var(--border-color); cursor: pointer;" onchange="handleReportDropdownChange(this.value)">
          <option value="rekap" ${currentTab === 'rekap' ? 'selected' : ''}>📊 Laporan Rekapitulasi Data Aset</option>
          <option value="detail" ${currentTab === 'detail' ? 'selected' : ''}>📑 Laporan Detail Seluruh Aset (77 Unit - Landscape)</option>
          <option value="maint" ${currentTab === 'maint' ? 'selected' : ''}>🛠️ Laporan Daftar Pemeliharaan Aset</option>
          <option value="konsolidasi" ${currentTab === 'konsolidasi' ? 'selected' : ''}>🏛️ Laporan Konsolidasi Lengkap (Semua Laporan)</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="page-header-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="exportReportPdf()">
          ${icons.print} Cetak / Simpan PDF
        </button>
        <button class="btn btn-outline" style="border-color: #10B981; color: #10B981; font-weight: 600;" onclick="exportReportExcel()">
          ${icons.download} Ekspor ke Excel (.xls)
        </button>
      </div>
    </div>

    <div id="report-view-wrapper">
      <div style="padding: 40px; text-align: center; color: var(--text-muted);">Menyiapkan dokumen laporan...</div>
    </div>
  `;

  if (currentTab === 'rekap') loadAuroraRekapReport();
  else if (currentTab === 'detail') loadAuroraDetailReport();
  else if (currentTab === 'maint') loadAuroraMaintenanceReport();
  else if (currentTab === 'konsolidasi') loadAuroraConsolidatedReport();
}

function handleReportDropdownChange(val) {
  state.reportTab = val;
  const wrapper = document.getElementById('report-view-wrapper');
  if (wrapper) {
    wrapper.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);">Memuat dokumen laporan...</div>';
  }
  if (val === 'rekap') loadAuroraRekapReport();
  else if (val === 'detail') loadAuroraDetailReport();
  else if (val === 'maint') loadAuroraMaintenanceReport();
  else if (val === 'konsolidasi') loadAuroraConsolidatedReport();
}

function setReportTab(tab) {
  state.reportTab = tab;
  renderReportsTab(document.getElementById('tab-content-area'));
}

// ---------------------------------------------------------------------
// FITUR CETAK / SIMPAN PDF
// ---------------------------------------------------------------------
function exportReportPdf() {
  const currentTab = state.reportTab || 'rekap';
  const origTitle = document.title;
  // Kosongkan title sementara agar browser tidak mencetak judul di header kertas
  document.title = '';

  let dynamicStyle = document.getElementById('report-print-landscape-style');
  if (!dynamicStyle) {
    dynamicStyle = document.createElement('style');
    dynamicStyle.id = 'report-print-landscape-style';
    document.head.appendChild(dynamicStyle);
  }

  if (currentTab === 'detail') {
    dynamicStyle.innerHTML = '@media print { @page { size: landscape; margin: 8mm 8mm; } .no-print, .page-header, .page-header * { display: none !important; } }';
  } else {
    dynamicStyle.innerHTML = '@media print { @page { size: portrait; margin: 10mm 12mm; } .no-print, .page-header, .page-header * { display: none !important; } }';
  }

  window.print();
  setTimeout(() => { document.title = origTitle; }, 1000);
}

const printCurrentReport = exportReportPdf;

// ---------------------------------------------------------------------
// FITUR EKSPOR KE EXCEL (.XLS - FORMAT ASLI MICROSOFT EXCEL)
// ---------------------------------------------------------------------
function downloadExcelWorkbook(htmlContent, filename = 'Laporan_Aset.xls') {
  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; margin-bottom: 20px; }
        th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; border: 1px solid #94A3B8; padding: 8px 10px; text-align: left; }
        td { border: 1px solid #CBD5E1; padding: 6px 10px; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .header-title { font-size: 16pt; font-weight: bold; color: #0F172A; text-align: center; }
        .header-sub { font-size: 11pt; color: #475569; text-align: center; margin-bottom: 12px; }
        .section-header { font-size: 12pt; font-weight: bold; background-color: #E2E8F0; padding: 8px; margin-top: 16px; }
        .total-row { font-weight: bold; background-color: #F1F5F9; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
  const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Dokumen Excel berhasil diunduh: ${filename}`, 'success');
}

async function exportReportExcel() {
  const currentTab = state.reportTab || 'rekap';
  const cp = state.company || {};
  const compName = (cp.company_name || 'PT. AURORA TEKNO GLOBAL').toUpperCase();
  const address = cp.address || '';
  const dateStr = new Date().toISOString().split('T')[0];

  showToast('Menyiapkan file Excel...', 'info');

  try {
    if (currentTab === 'detail') {
      const res = await api('/reports/aurora-detail');
      const allAssets = res.data || [];
      const totalVal = allAssets.reduce((s, a) => s + (a.value || 0), 0);
      const totalQty = allAssets.reduce((s, a) => s + (a.quantity || 1), 0);

      const html = `
        <div class="header-title">${compName}</div>
        <div class="header-sub">LAPORAN DETAIL DATA ASET (${allAssets.length} UNIT) | ${address}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">NO</th>
              <th>NAMA ASET</th>
              <th>KODE ASET</th>
              <th style="text-align: center;">JUMLAH</th>
              <th>JENIS BARANG</th>
              <th>EQUITAS</th>
              <th>LOKASI / RUANGAN</th>
              <th style="text-align: center;">TGL PEROLEHAN</th>
              <th style="text-align: right;">NILAI PEROLEHAN (RP)</th>
              <th style="text-align: center;">KONDISI ASET</th>
            </tr>
          </thead>
          <tbody>
            ${allAssets.map(a => `
              <tr>
                <td class="center">${a.item_no}</td>
                <td class="bold">${a.name}</td>
                <td>${a.code || '-'}</td>
                <td class="center">${a.quantity} Buah</td>
                <td>${a.category_name}</td>
                <td>${a.equity || 'AURORA'}</td>
                <td>${a.room_name}</td>
                <td class="center">${a.purchase_date}</td>
                <td class="right">${formatRupiah(a.value)}</td>
                <td class="center">${a.condition_name}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="right">TOTAL KESELURUHAN (77 ASET):</td>
              <td class="center">${totalQty} Buah</td>
              <td colspan="4"></td>
              <td class="right">${formatRupiah(totalVal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      `;
      downloadExcelWorkbook(html, `Detail_77_Aset_${dateStr}.xls`);

    } else if (currentTab === 'maint') {
      const res = await api('/reports/aurora-maintenance');
      const { sections, summary } = res;
      const html = `
        <div class="header-title">${compName}</div>
        <div class="header-sub">LAPORAN DAFTAR PEMELIHARAAN ASET | ${address}</div>
        
        <div class="section-header">A. PERAWATAN BULAN INI</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">NO</th>
              <th>NAMA ASET</th>
              <th>JENIS BARANG</th>
              <th>TIPE PERAWATAN</th>
              <th style="text-align: center;">TGL PELAKSANAAN</th>
              <th style="text-align: center;">JUMLAH</th>
              <th style="text-align: right;">BIAYA (RP)</th>
              <th style="text-align: center;">BUKTI</th>
              <th>KETERANGAN / TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            ${sections.bulan_ini.length === 0 ? `<tr><td colspan="9" class="center">Tidak ada pemeliharaan bulan ini.</td></tr>` : 
              sections.bulan_ini.map((m, idx) => `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td class="bold">${m.item_name}</td>
                  <td>${m.category_name}</td>
                  <td>${m.maint_type}</td>
                  <td class="center">${m.request_date}</td>
                  <td class="center">${m.quantity} ${m.unit}</td>
                  <td class="right">${formatRupiah(m.cost)}</td>
                  <td class="center">${m.proof || '-'}</td>
                  <td>${m.notes || '-'}</td>
                </tr>
              `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="6" class="right">SUBTOTAL BULAN INI:</td>
              <td class="right">${formatRupiah(summary.cost_bulan_ini)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div class="section-header">B. PERAWATAN SAMPAI DENGAN BULAN KEMARIN</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">NO</th>
              <th>NAMA ASET</th>
              <th>JENIS BARANG</th>
              <th>TIPE PERAWATAN</th>
              <th style="text-align: center;">TGL PELAKSANAAN</th>
              <th style="text-align: center;">JUMLAH</th>
              <th style="text-align: right;">BIAYA (RP)</th>
              <th style="text-align: center;">BUKTI</th>
              <th>KETERANGAN / TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            ${sections.bulan_kemarin.map((m, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="bold">${m.item_name}</td>
                <td>${m.category_name}</td>
                <td>${m.maint_type}</td>
                <td class="center">${m.request_date}</td>
                <td class="center">${m.quantity} ${m.unit}</td>
                <td class="right">${formatRupiah(m.cost)}</td>
                <td class="center">${m.proof || '-'}</td>
                <td>${m.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="6" class="right">TOTAL BIAYA PEMELIHARAAN:</td>
              <td class="right">${formatRupiah(summary.total_cost)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      `;
      downloadExcelWorkbook(html, `Pemeliharaan_Aset_${dateStr}.xls`);

    } else if (currentTab === 'konsolidasi') {
      const [rekapRes, detailRes, maintRes] = await Promise.all([
        api('/reports/aurora-rekap'),
        api('/reports/aurora-detail'),
        api('/reports/aurora-maintenance')
      ]);
      const { summary, rekap_jenis_barang, rekap_kondisi } = rekapRes;
      const allAssets = detailRes.data || [];
      const maintSections = maintRes.sections;
      const maintSummary = maintRes.summary;

      const html = `
        <div class="header-title">${compName}</div>
        <div class="header-sub">LAPORAN KONSOLIDASI MANAJEMEN ASET & PEMELIHARAAN | ${address}</div>

        <div class="section-header">BAGIAN I. RINGKASAN EKSEKUTIF & REKAPITULASI</div>
        <table>
          <thead>
            <tr><th>INDIKATOR METRIK</th><th>TOTAL NILAI / KUANTITAS</th><th>KETERANGAN</th></tr>
          </thead>
          <tbody>
            <tr><td class="bold">Total Unit Aset</td><td class="bold">${summary.total_assets} Unit</td><td>Terdaftar di sistem database</td></tr>
            <tr><td class="bold">Total Valuasi Nilai Perolehan</td><td class="bold">${formatRupiah(summary.total_value)}</td><td>Akumulasi perolehan aset</td></tr>
            <tr><td class="bold">Total Pemeliharaan Aset</td><td class="bold">${summary.total_maintenance} Tiket</td><td>Tiket terencana dan tidak terencana</td></tr>
            <tr><td class="bold">Total Realisasi Biaya Pemeliharaan</td><td class="bold">${formatRupiah(summary.total_cost)}</td><td>Akumulasi pembiayaan perawatan</td></tr>
          </tbody>
        </table>

        <div class="section-header">BAGIAN II. RINCIAN SELURUH DATA INVENTARIS ASET (${allAssets.length} UNIT)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">NO</th>
              <th>NAMA ASET</th>
              <th>KODE ASET</th>
              <th style="text-align: center;">JUMLAH</th>
              <th>JENIS BARANG</th>
              <th>EQUITAS</th>
              <th>LOKASI / RUANGAN</th>
              <th style="text-align: center;">TGL PEROLEHAN</th>
              <th style="text-align: right;">NILAI PEROLEHAN (RP)</th>
              <th style="text-align: center;">KONDISI ASET</th>
            </tr>
          </thead>
          <tbody>
            ${allAssets.map(a => `
              <tr>
                <td class="center">${a.item_no}</td>
                <td class="bold">${a.name}</td>
                <td>${a.code || '-'}</td>
                <td class="center">${a.quantity} Buah</td>
                <td>${a.category_name}</td>
                <td>${a.equity || 'AURORA'}</td>
                <td>${a.room_name}</td>
                <td class="center">${a.purchase_date}</td>
                <td class="right">${formatRupiah(a.value)}</td>
                <td class="center">${a.condition_name}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="right">TOTAL VALUASI ASET:</td>
              <td class="center">${allAssets.reduce((s, a) => s + (a.quantity || 1), 0)} Buah</td>
              <td colspan="4"></td>
              <td class="right">${formatRupiah(summary.total_value)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="section-header">BAGIAN III. DAFTAR PEMELIHARAAN & PERAWATAN ASET</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">NO</th>
              <th>NAMA ASET</th>
              <th>JENIS BARANG</th>
              <th>TIPE PERAWATAN</th>
              <th style="text-align: center;">TGL PELAKSANAAN</th>
              <th style="text-align: center;">JUMLAH</th>
              <th style="text-align: right;">BIAYA (RP)</th>
              <th>KETERANGAN / TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            ${maintSections.bulan_kemarin.map((m, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="bold">${m.item_name}</td>
                <td>${m.category_name}</td>
                <td>${m.maint_type}</td>
                <td class="center">${m.request_date}</td>
                <td class="center">${m.quantity} ${m.unit}</td>
                <td class="right">${formatRupiah(m.cost)}</td>
                <td>${m.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="6" class="right">TOTAL BIAYA PEMELIHARAAN:</td>
              <td class="right">${formatRupiah(maintSummary.total_cost)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      `;
      downloadExcelWorkbook(html, `Konsolidasi_Lengkap_Aset_${dateStr}.xls`);

    } else {
      // Rekapitulasi default
      const res = await api('/reports/aurora-rekap');
      const { summary, rekap_jenis_barang, rekap_kondisi, rekap_lokasi } = res;
      const html = `
        <div class="header-title">${compName}</div>
        <div class="header-sub">LAPORAN REKAPITULASI DATA ASET | ${address}</div>

        <div class="section-header">1. RINGKASAN METRIK UTAMA</div>
        <table>
          <thead><tr><th>INDIKATOR</th><th>NILAI</th></tr></thead>
          <tbody>
            <tr><td class="bold">Total Unit Aset Terdaftar</td><td class="bold">${summary.total_assets} Unit</td></tr>
            <tr><td class="bold">Total Valuasi Nilai Perolehan</td><td class="bold">${formatRupiah(summary.total_value)}</td></tr>
            <tr><td class="bold">Total Tiket Pemeliharaan</td><td class="bold">${summary.total_maintenance} Kali</td></tr>
            <tr><td class="bold">Total Biaya Pemeliharaan</td><td class="bold">${formatRupiah(summary.total_cost)}</td></tr>
          </tbody>
        </table>

        <div class="section-header">2. REKAPITULASI BERDASARKAN JENIS BARANG</div>
        <table>
          <thead>
            <tr><th>NO</th><th>JENIS BARANG</th><th>JUMLAH UNIT</th><th>% UNIT</th><th>NILAI PEROLEHAN</th><th>% NILAI</th></tr>
          </thead>
          <tbody>
            ${rekap_jenis_barang.map((b, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="bold">${b.name}</td>
                <td class="center">${b.unit} Unit</td>
                <td class="center">${b.pct_unit}%</td>
                <td class="right">${formatRupiah(b.nilai)}</td>
                <td class="center">${b.pct_nilai}%</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2" class="right">TOTAL:</td>
              <td class="center">${summary.total_assets} Unit</td>
              <td class="center">100.00%</td>
              <td class="right">${formatRupiah(summary.total_value)}</td>
              <td class="center">100.00%</td>
            </tr>
          </tfoot>
        </table>

        <div class="section-header">3. REKAPITULASI KONDISI FISIK ASET</div>
        <table>
          <thead>
            <tr><th>NO</th><th>KONDISI FISIK</th><th>TINGKAT</th><th>JUMLAH UNIT</th><th>% UNIT</th><th>TOTAL NILAI</th></tr>
          </thead>
          <tbody>
            ${rekap_kondisi.map((k, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="bold">${k.name}</td>
                <td class="center">${k.level}</td>
                <td class="center">${k.unit} Unit</td>
                <td class="center">${k.pct_unit}%</td>
                <td class="right">${formatRupiah(k.nilai)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      downloadExcelWorkbook(html, `Rekapitulasi_Aset_${dateStr}.xls`);
    }
  } catch (err) {
    showToast(`Gagal mengekspor Excel: ${err.message}`, 'error');
  }
}

function getIndonesianDateStr() {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const d = new Date();
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getOfficialSignBlock() {
  const sig = state.signature || {
    sign1_title: 'Direktur Operasional',
    sign1_name: 'Ir. H. Rahmat Hidayat',
    sign1_id: 'NIP. 19780512 200312 1 002',
    sign2_title: 'Pengelola Aset & Logistik',
    sign2_name: 'Ade Suharmin',
    sign2_id: 'NIP. 19850320 201001 1 015',
    sign_city: 'Bandung'
  };
  const city = sig.sign_city || 'Bandung';

  return `
    <div class="report-sign-block" style="margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid; break-inside: avoid;">
      <div style="text-align: center; min-width: 220px;">
        <div style="font-size: 11px; color: var(--text-subtle); margin-bottom: 56px; line-height: 1.5;">
          Mengetahui,<br><strong>${sig.sign1_title}</strong>
        </div>
        <div style="border-bottom: 1.5px solid var(--text-main); width: 210px; margin: 0 auto;"></div>
        <div style="font-size: 11px; font-weight: 700; margin-top: 5px; color: var(--text-main);">( ${sig.sign1_name} )</div>
        ${sig.sign1_id ? `<div style="font-size: 10px; color: var(--text-subtle); margin-top: 2px;">${sig.sign1_id}</div>` : ''}
      </div>
      <div style="text-align: center; min-width: 220px;">
        <div style="font-size: 11px; color: var(--text-subtle); margin-bottom: 56px; line-height: 1.5;">
          ${city}, ${getIndonesianDateStr()}<br><strong>${sig.sign2_title}</strong>
        </div>
        <div style="border-bottom: 1.5px solid var(--text-main); width: 210px; margin: 0 auto;"></div>
        <div style="font-size: 11px; font-weight: 700; margin-top: 5px; color: var(--text-main);">( ${sig.sign2_name} )</div>
        ${sig.sign2_id ? `<div style="font-size: 10px; color: var(--text-subtle); margin-top: 2px;">${sig.sign2_id}</div>` : ''}
      </div>
    </div>
  `;
}

function getAuroraKopHeader(pageTitle, pageNumberText = '') {
  const cp = state.company || {};
  const compName = (cp.company_name || 'PT. AURORA TEKNO GLOBAL').toUpperCase();
  const address = cp.address || 'Jl. Batununggal Indah II No.145, Mengger, Kec. Bandung Kidul, Kota Bandung, Jawa Barat 40267';
  const contacts = [
    cp.phone && cp.phone !== '-' ? `Telp: ${cp.phone}` : '',
    cp.email ? `Email: ${cp.email}` : '',
    cp.website ? `Website: ${cp.website}` : ''
  ].filter(Boolean).join(' | ');

  return `
    <div class="aurora-doc-header">
      <div class="kop-brand-row">
        <div class="kop-brand-info">
          ${cp.logo_url 
            ? `<img src="${cp.logo_url}" class="kop-logo-img" alt="Logo">`
            : `<div class="brand-badge kop-logo-fallback">AA</div>`
          }
          <div class="kop-text-block">
            <div class="kop-company-name">${compName}</div>
            <div class="kop-address-text">${address} ${contacts ? `<br>${contacts}` : ''}</div>
          </div>
        </div>
        ${pageNumberText ? `
          <div class="badge badge-neutral kop-badge-page">
            ${pageNumberText}
          </div>
        ` : ''}
      </div>
      <div class="kop-divider-official">
        <div class="kop-divider-official-line-1"></div>
        <div class="kop-divider-official-line-2"></div>
      </div>
    </div>

    <!-- Header Judul Dokumen Berwarna Elegan (Anti-Slop Corporate Palette) -->
    <div class="report-document-title-wrapper">
      <div class="report-document-title-banner">
        <h2 class="report-document-title">${pageTitle.toUpperCase()}</h2>
        <div class="report-document-subtitle">${compName} &bull; SISTEM MANAJEMEN ASET</div>
      </div>
    </div>
  `;
}

// 1. REKAPITULASI DATA ASET
async function loadAuroraRekapReport() {
  const wrapper = document.getElementById('report-view-wrapper');
  try {
    const res = await api('/reports/aurora-rekap');
    const { summary, rekap_jenis_barang, rekap_lokasi, rekap_kondisi, rekap_pemeliharaan } = res;

    wrapper.innerHTML = `
      <!-- Bagian 1 (Halaman 1 dari 4): Ringkasan Metrik & Jenis Barang -->
      <div class="aurora-doc-card rekap-page-card">
        ${getAuroraKopHeader('LAPORAN REKAPITULASI ASET - RINGKASAN & JENIS BARANG', 'Halaman 1 dari 4')}

        <!-- 4 Metric Cards -->
        <div class="kpi-row" style="margin-bottom: 24px;">
          <div class="kpi-card">
            <div class="kpi-card-label">Total Unit Aset</div>
            <div class="kpi-card-value">${summary.total_assets} Unit</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Terdaftar di database</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card-label">Total Valuasi Nilai Aset</div>
            <div class="kpi-card-value" style="color: #60A5FA;">${formatRupiah(summary.total_value)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Akumulasi nilai perolehan</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card-label">Total Pemeliharaan</div>
            <div class="kpi-card-value">${summary.total_maintenance} Tiket</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Terencana & tidak terencana</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card-label">Total Biaya Pemeliharaan</div>
            <div class="kpi-card-value" style="color: #34D399;">${formatRupiah(summary.total_cost)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Realisasi biaya perawatan</div>
          </div>
        </div>

        <!-- Tabel Rekap Jenis Barang -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">1. Rekapitulasi Berdasarkan Jenis Barang / Kategori</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">NO</th>
                  <th>JENIS BARANG / KATEGORI</th>
                  <th style="width: 140px; text-align: center;">JUMLAH UNIT</th>
                  <th style="width: 90px; text-align: center;">% UNIT</th>
                  <th style="width: 180px; text-align: right;">NILAI PEROLEHAN</th>
                  <th style="width: 90px; text-align: center;">% NILAI</th>
                </tr>
              </thead>
              <tbody>
                ${rekap_jenis_barang.map((b, idx) => `
                  <tr>
                    <td class="mono" style="text-align: center;">${idx + 1}</td>
                    <td style="font-weight: 600;">${b.name}</td>
                    <td class="mono" style="text-align: center;">${b.unit} Unit</td>
                    <td class="mono" style="text-align: center;">${b.pct_unit}%</td>
                    <td class="mono" style="text-align: right;">${formatRupiah(b.nilai)}</td>
                    <td class="mono" style="text-align: center;">${b.pct_nilai}%</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                  <td colspan="2" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN:</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">${summary.total_assets} Unit</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                  <td class="mono" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">${formatRupiah(summary.total_value)}</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- Bagian 2 (Halaman 2 dari 4): Kondisi Fisik Aset -->
      <div class="aurora-doc-card rekap-page-card">
        ${getAuroraKopHeader('LAPORAN REKAPITULASI ASET - KONDISI FISIK', 'Halaman 2 dari 4')}
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">2. Rekapitulasi Berdasarkan Kondisi Fisik Aset</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">NO</th>
                  <th>KONDISI FISIK ASET</th>
                  <th style="width: 150px; text-align: center;">STATUS TINGKAT</th>
                  <th style="width: 140px; text-align: center;">JUMLAH UNIT</th>
                  <th style="width: 90px; text-align: center;">% UNIT</th>
                  <th style="width: 180px; text-align: right;">TOTAL NILAI</th>
                </tr>
              </thead>
              <tbody>
                ${rekap_kondisi.map((k, idx) => `
                  <tr>
                    <td class="mono" style="text-align: center;">${idx + 1}</td>
                    <td style="font-weight: 600;">${k.name}</td>
                    <td class="mono" style="text-align: center;">${k.level}</td>
                    <td class="mono" style="font-weight: 600; text-align: center;">${k.unit} Unit</td>
                    <td class="mono" style="text-align: center;">${k.pct_unit}%</td>
                    <td class="mono" style="text-align: right;">${formatRupiah(k.nilai)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                  <td colspan="3" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN:</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">${summary.total_assets} Unit</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                  <td class="mono" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">${formatRupiah(summary.total_value)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- Bagian 3 (Halaman 3 dari 4): Lokasi & Ruangan -->
      <div class="aurora-doc-card rekap-page-card">
        ${getAuroraKopHeader('LAPORAN REKAPITULASI ASET - LOKASI & RUANGAN', 'Halaman 3 dari 4')}
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">3. Rekapitulasi Berdasarkan Lokasi / Ruangan Penempatan</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">NO</th>
                  <th>LOKASI / RUANGAN</th>
                  <th style="width: 180px; text-align: center;">GEDUNG & LANTAI</th>
                  <th style="width: 140px; text-align: center;">JUMLAH UNIT</th>
                  <th style="width: 90px; text-align: center;">% UNIT</th>
                  <th style="width: 180px; text-align: right;">TOTAL NILAI</th>
                </tr>
              </thead>
              <tbody>
                ${rekap_lokasi.map((l, idx) => `
                  <tr>
                    <td class="mono" style="text-align: center;">${idx + 1}</td>
                    <td style="font-weight: 600;">${l.name}</td>
                    <td style="text-align: center;">${l.building || '-'} ${l.floor ? `(${l.floor})` : ''}</td>
                    <td class="mono" style="text-align: center;">${l.unit} Unit</td>
                    <td class="mono" style="text-align: center;">${l.pct_unit}%</td>
                    <td class="mono" style="text-align: right;">${formatRupiah(l.nilai)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                  <td colspan="3" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN:</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">${summary.total_assets} Unit</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                  <td class="mono" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">${formatRupiah(summary.total_value)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- Bagian 4 (Halaman 4 dari 4): Pemeliharaan & Lembar Pengesahan -->
      <div class="aurora-doc-card rekap-page-card">
        ${getAuroraKopHeader('LAPORAN REKAPITULASI ASET - PEMELIHARAAN & PENGESAHAN', 'Halaman 4 dari 4')}
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">4. Rekapitulasi Jenis Pekerjaan Pemeliharaan</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">NO</th>
                  <th>JENIS PEMELIHARAAN</th>
                  <th style="width: 140px; text-align: center;">FREKUENSI</th>
                  <th style="width: 180px; text-align: right;">TOTAL BIAYA</th>
                  <th style="width: 100px; text-align: center;">% BIAYA</th>
                </tr>
              </thead>
              <tbody>
                ${rekap_pemeliharaan.map((m, idx) => `
                  <tr>
                    <td class="mono" style="text-align: center;">${idx + 1}</td>
                    <td style="font-weight: 600;">${m.maint_type}</td>
                    <td class="mono" style="text-align: center;">${m.frequency} Kali</td>
                    <td class="mono" style="font-weight: 600; color: #60A5FA; text-align: right;">${formatRupiah(m.total_cost)}</td>
                    <td class="mono" style="text-align: center;">${m.pct_cost}%</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                  <td colspan="2" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN:</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">${summary.total_maintenance} Kali</td>
                  <td class="mono" style="color: #0F172A; text-align: right; font-weight: 700; background-color: #E2E8F0 !important;">${formatRupiah(summary.total_cost)}</td>
                  <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Lembar Pengesahan Resmi -->
        ${getOfficialSignBlock()}
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat Rekapitulasi: ${err.message}</p></div>`;
  }
}

// 2. DATA DETAIL ASET (LANDSCAPE MODE - 77 UNIT LENGKAP)
async function loadAuroraDetailReport() {
  const wrapper = document.getElementById('report-view-wrapper');
  try {
    const res = await api('/reports/aurora-detail');
    const allAssets = res.data || [];
    const totalVal = res.total_value || allAssets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalQty = allAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);

    wrapper.innerHTML = `
      <div class="aurora-doc-card">
        ${getAuroraKopHeader('LAPORAN DETAIL DATA ASET')}

        <div class="landscape-table-wrapper">
          <table class="landscape-table">
            <thead>
              <tr>
                <th style="width: 38px; text-align: center;">NO</th>
                <th>NAMA ASET</th>
                <th>KODE ASET</th>
                <th style="text-align: center;">JUMLAH</th>
                <th>JENIS BARANG</th>
                <th>EQUITAS</th>
                <th>LOKASI / RUANGAN</th>
                <th style="text-align: center;">TANGGAL PEROLEHAN</th>
                <th style="text-align: right;">NILAI PEROLEHAN (RP)</th>
                <th style="text-align: center;">KONDISI ASET</th>
              </tr>
            </thead>
            <tbody>
              ${allAssets.map(a => `
                <tr>
                  <td class="mono" style="text-align: center; color: var(--text-subtle);">${a.item_no}</td>
                  <td style="font-weight: 600;">${a.name}</td>
                  <td class="mono">${a.code || '-'}</td>
                  <td class="mono" style="text-align: center;">${a.quantity} Buah</td>
                  <td>${a.category_name}</td>
                  <td class="mono">${a.equity || 'AURORA'}</td>
                  <td>${a.room_name}</td>
                  <td class="mono" style="text-align: center;">${a.purchase_date}</td>
                  <td class="mono" style="text-align: right; font-weight: 600;">${formatRupiah(a.value)}</td>
                  <td style="text-align: center; font-weight: 500;">${a.condition_name || 'Baik'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                <td colspan="3" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN (77 ASET):</td>
                <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">${totalQty} Buah</td>
                <td colspan="4" style="background-color: #E2E8F0 !important;"></td>
                <td class="mono" style="text-align: right; color: #0F172A !important; font-weight: 700; font-size: 13px; background-color: #E2E8F0 !important;">${formatRupiah(totalVal)}</td>
                <td style="background-color: #E2E8F0 !important;"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Lembar Pengesahan Resmi -->
        ${getOfficialSignBlock()}
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat Detail Aset: ${err.message}</p></div>`;
  }
}

// 3. DAFTAR PEMELIHARAAN ASET
async function loadAuroraMaintenanceReport() {
  const wrapper = document.getElementById('report-view-wrapper');
  try {
    const res = await api('/reports/aurora-maintenance');
    const { summary, sections, all } = res;

    wrapper.innerHTML = `
      <div class="aurora-doc-card">
        ${getAuroraKopHeader('DAFTAR PEMELIHARAAN ASET')}

        <!-- Bagian A: Bulan Ini -->
        <div style="margin-bottom: 28px;">
          <div class="report-section-badge">
            A. PERAWATAN BULAN INI
          </div>
          <div class="table-container">
            <table class="data-table" style="font-size: 11px;">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">NO</th>
                  <th>NAMA ASET</th>
                  <th>JENIS BARANG</th>
                  <th>TIPE PERAWATAN</th>
                  <th style="text-align: center;">TANGGAL PELAKSANAAN</th>
                  <th style="text-align: center;">JUMLAH</th>
                  <th style="text-align: right;">BIAYA (RP)</th>
                  <th style="text-align: center;">BUKTI</th>
                  <th>KETERANGAN / TINDAKAN</th>
                </tr>
              </thead>
              <tbody>
                ${sections.bulan_ini.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 18px;">
                      Tidak ada pemeliharaan aset pada periode Bulan Ini.
                    </td>
                  </tr>
                ` : sections.bulan_ini.map((m, idx) => `
                  <tr>
                    <td class="mono" style="text-align: center;">${idx + 1}</td>
                    <td style="font-weight: 600;">${m.item_name}</td>
                    <td>${m.category_name}</td>
                    <td style="font-weight: 500;">${m.maint_type}</td>
                    <td class="mono" style="text-align: center;">${m.request_date}</td>
                    <td class="mono" style="text-align: center;">${m.quantity} ${m.unit}</td>
                    <td class="mono" style="text-align: right; font-weight: 600; color: var(--primary);">${formatRupiah(m.cost)}</td>
                    <td class="mono" style="text-align: center;">${m.proof || '-'}</td>
                    <td>${m.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              ${sections.bulan_ini.length > 0 ? `
                <tfoot>
                  <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                    <td colspan="6" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">SUBTOTAL BULAN INI:</td>
                    <td class="mono" style="text-align: right; color: #0F172A !important; font-weight: 700; background-color: #E2E8F0 !important;">${formatRupiah(summary.cost_bulan_ini)}</td>
                    <td colspan="2" style="background-color: #E2E8F0 !important;"></td>
                  </tr>
                </tfoot>
              ` : ''}
            </table>
          </div>
        </div>

        <!-- Bagian B: Sampai Dengan Bulan Kemarin -->
        <div>
          <div class="report-section-badge">
            B. PERAWATAN SAMPAI DENGAN BULAN KEMARIN
          </div>
          <div class="table-container">
            <table class="data-table" style="font-size: 11px;">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">NO</th>
                  <th>NAMA ASET</th>
                  <th>JENIS BARANG</th>
                  <th>TIPE PERAWATAN</th>
                  <th style="text-align: center;">TANGGAL PELAKSANAAN</th>
                  <th style="text-align: center;">JUMLAH</th>
                  <th style="text-align: right;">BIAYA (RP)</th>
                  <th style="text-align: center;">BUKTI</th>
                  <th>KETERANGAN / TINDAKAN</th>
                </tr>
              </thead>
              <tbody>
                ${sections.bulan_kemarin.map((m, idx) => `
                  <tr>
                    <td class="mono" style="text-align: center;">${idx + 1}</td>
                    <td style="font-weight: 600;">${m.item_name}</td>
                    <td>${m.category_name}</td>
                    <td style="font-weight: 500;">${m.maint_type}</td>
                    <td class="mono" style="text-align: center;">${m.request_date}</td>
                    <td class="mono" style="text-align: center;">${m.quantity} ${m.unit}</td>
                    <td class="mono" style="text-align: right; font-weight: 600; color: var(--primary);">${formatRupiah(m.cost)}</td>
                    <td class="mono" style="text-align: center;">${m.proof || '-'}</td>
                    <td>${m.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                  <td colspan="6" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN BIAYA PEMELIHARAAN:</td>
                  <td class="mono" style="text-align: right; color: #0F172A !important; font-size: 13px; font-weight: 700; background-color: #E2E8F0 !important;">${formatRupiah(summary.total_cost)}</td>
                  <td colspan="2" style="background-color: #E2E8F0 !important;"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Lembar Pengesahan Resmi -->
        ${getOfficialSignBlock()}
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat Pemeliharaan: ${err.message}</p></div>`;
  }
}

// 4. LAPORAN KONSOLIDASI LENGKAP (SEMUA DOKUMEN DALAM SATU MASTER REPORT)
async function loadAuroraConsolidatedReport() {
  const wrapper = document.getElementById('report-view-wrapper');
  try {
    const [rekapRes, detailRes, maintRes] = await Promise.all([
      api('/reports/aurora-rekap'),
      api('/reports/aurora-detail'),
      api('/reports/aurora-maintenance')
    ]);

    const { summary, rekap_jenis_barang, rekap_lokasi, rekap_kondisi } = rekapRes;
    const allAssets = detailRes.data || [];
    const maintSections = maintRes.sections;
    const maintSummary = maintRes.summary;

    wrapper.innerHTML = `
      <!-- BAGIAN I: RINGKASAN REKAPITULASI -->
      <div class="aurora-doc-card consolidated-page-card">
        ${getAuroraKopHeader('LAPORAN KONSOLIDASI - RINGKASAN EKSEKUTIF', 'Bagian I')}

        <div style="margin-bottom: 24px;">
          <div class="report-section-badge">BAGIAN I. RINGKASAN & REKAPITULASI EKSEKUTIF</div>
          
          <div class="kpi-row" style="margin: 16px 0 24px 0;">
            <div class="kpi-card">
              <div class="kpi-card-label">Total Unit Aset</div>
              <div class="kpi-card-value">${summary.total_assets} Unit</div>
              <div class="kpi-card-footnote">Terdaftar di sistem</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-label">Total Valuasi Nilai Aset</div>
              <div class="kpi-card-value" style="color: var(--primary);">${formatRupiah(summary.total_value)}</div>
              <div class="kpi-card-footnote">Akumulasi perolehan</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-label">Total Pemeliharaan</div>
              <div class="kpi-card-value">${summary.total_maintenance} Tiket</div>
              <div class="kpi-card-footnote">Selesai terdata</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-card-label">Realisasi Biaya Perawatan</div>
              <div class="kpi-card-value" style="color: #10B981;">${formatRupiah(summary.total_cost)}</div>
              <div class="kpi-card-footnote">Total pembiayaan</div>
            </div>
          </div>

          <div class="grid-two-column" style="margin-bottom: 24px;">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Rekapitulasi Berdasarkan Jenis Barang</div></div>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr><th>NO</th><th>JENIS BARANG</th><th>JUMLAH</th><th>% UNIT</th><th>NILAI PEROLEHAN</th><th>% NILAI</th></tr>
                  </thead>
                  <tbody>
                    ${rekap_jenis_barang.map((b, idx) => `
                      <tr>
                        <td class="mono">${idx + 1}</td>
                        <td style="font-weight: 600;">${b.name}</td>
                        <td class="mono">${b.unit} Unit</td>
                        <td class="mono">${b.pct_unit}%</td>
                        <td class="mono">${formatRupiah(b.nilai)}</td>
                        <td class="mono">${b.pct_nilai}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                      <td colspan="2" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN:</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">${summary.total_assets} Unit</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">${formatRupiah(summary.total_value)}</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Rekapitulasi Kondisi Fisik Aset</div></div>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr><th>NO</th><th>KONDISI ASET</th><th>STATUS TINGKAT</th><th>JUMLAH</th><th>% UNIT</th><th>TOTAL NILAI</th></tr>
                  </thead>
                  <tbody>
                    ${rekap_kondisi.map((k, idx) => `
                      <tr>
                        <td class="mono">${idx + 1}</td>
                        <td style="font-weight: 600;">${k.name}</td>
                        <td class="mono">${k.level}</td>
                        <td class="mono" style="font-weight: 600;">${k.unit} Unit</td>
                        <td class="mono">${k.pct_unit}%</td>
                        <td class="mono">${formatRupiah(k.nilai)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                      <td colspan="3" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN:</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">${summary.total_assets} Unit</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">100.00%</td>
                      <td class="mono" style="background-color: #E2E8F0 !important; color: #0F172A !important;">${formatRupiah(summary.total_value)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- BAGIAN II: DAFTAR DETAIL 77 UNIT ASET (HALAMAN BARU) -->
      <div class="aurora-doc-card consolidated-page-card" style="page-break-before: always; break-before: page;">
        ${getAuroraKopHeader('LAPORAN KONSOLIDASI - RINCIAN INVENTARIS ASET', 'Bagian II')}

        <div class="report-section-badge">BAGIAN II. RINCIAN SELURUH DATA INVENTARIS ASET (${allAssets.length} UNIT)</div>
        <div class="landscape-table-wrapper" style="margin-top: 14px;">
          <table class="landscape-table">
            <thead>
              <tr>
                <th style="width: 38px; text-align: center;">NO</th>
                <th>NAMA ASET</th>
                <th>KODE ASET</th>
                <th style="text-align: center;">JUMLAH</th>
                <th>JENIS BARANG</th>
                <th>EQUITAS</th>
                <th>LOKASI / RUANGAN</th>
                <th style="text-align: center;">TANGGAL PEROLEHAN</th>
                <th style="text-align: right;">NILAI PEROLEHAN (RP)</th>
                <th style="text-align: center;">KONDISI ASET</th>
              </tr>
            </thead>
            <tbody>
              ${allAssets.map(a => `
                <tr>
                  <td class="mono" style="text-align: center; color: var(--text-subtle);">${a.item_no}</td>
                  <td style="font-weight: 600;">${a.name}</td>
                  <td class="mono">${a.code || '-'}</td>
                  <td class="mono" style="text-align: center;">${a.quantity} Buah</td>
                  <td>${a.category_name}</td>
                  <td class="mono">${a.equity || 'AURORA'}</td>
                  <td>${a.room_name}</td>
                  <td class="mono" style="text-align: center;">${a.purchase_date}</td>
                  <td class="mono" style="text-align: right; font-weight: 600;">${formatRupiah(a.value)}</td>
                  <td style="text-align: center; font-weight: 500;">${a.condition_name || 'Baik'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                <td colspan="3" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN (77 ASET):</td>
                <td class="mono" style="text-align: center; background-color: #E2E8F0 !important; color: #0F172A !important;">${allAssets.reduce((s, a) => s + (a.quantity || 1), 0)} Buah</td>
                <td colspan="4" style="background-color: #E2E8F0 !important;"></td>
                <td class="mono" style="text-align: right; color: #0F172A !important; font-weight: 700; font-size: 13px; background-color: #E2E8F0 !important;">${formatRupiah(summary.total_value)}</td>
                <td style="background-color: #E2E8F0 !important;"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- BAGIAN III: PEMELIHARAAN (HALAMAN BARU) -->
      <div class="aurora-doc-card consolidated-page-card" style="page-break-before: always; break-before: page;">
        ${getAuroraKopHeader('LAPORAN KONSOLIDASI - PEMELIHARAAN & PENGESAHAN', 'Bagian III')}

        <div class="report-section-badge">BAGIAN III. DAFTAR PEMELIHARAAN & PERAWATAN ASET</div>
        <div class="table-container" style="margin-top: 14px;">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 38px; text-align: center;">NO</th>
                <th>NAMA ASET</th>
                <th>JENIS BARANG</th>
                <th>TIPE PERAWATAN</th>
                <th style="text-align: center;">TANGGAL PELAKSANAAN</th>
                <th style="text-align: center;">JUMLAH</th>
                <th style="text-align: right;">BIAYA (RP)</th>
                <th style="text-align: center;">BUKTI</th>
                <th>KETERANGAN / TINDAKAN</th>
              </tr>
            </thead>
            <tbody>
              ${maintSections.bulan_kemarin.map((m, idx) => `
                <tr>
                  <td class="mono" style="text-align: center;">${idx + 1}</td>
                  <td style="font-weight: 600;">${m.item_name}</td>
                  <td>${m.category_name}</td>
                  <td style="font-weight: 500;">${m.maint_type}</td>
                  <td class="mono" style="text-align: center;">${m.request_date}</td>
                  <td class="mono" style="text-align: center;">${m.quantity} ${m.unit}</td>
                  <td class="mono" style="text-align: right; font-weight: 600; color: var(--primary);">${formatRupiah(m.cost)}</td>
                  <td class="mono" style="text-align: center;">${m.proof || '-'}</td>
                  <td>${m.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row" style="font-weight: 700; background-color: #E2E8F0 !important; color: #0F172A !important;">
                <td colspan="6" style="text-align: right; background-color: #E2E8F0 !important; color: #0F172A !important;">TOTAL KESELURUHAN BIAYA PEMELIHARAAN:</td>
                <td class="mono" style="text-align: right; color: #0F172A !important; font-size: 13px; font-weight: 700; background-color: #E2E8F0 !important;">${formatRupiah(maintSummary.total_cost)}</td>
                <td colspan="2" style="background-color: #E2E8F0 !important;"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Lembar Pengesahan Resmi -->
        ${getOfficialSignBlock()}
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>Gagal memuat Laporan Konsolidasi: ${err.message}</p></div>`;
  }
}

const loadAuroraFullDocument = loadAuroraConsolidatedReport;

// ---------------------------------------------------------------------
// 8. TAB: SETTINGS & DATABASE
// ---------------------------------------------------------------------
async function renderSettingsTab(container) {
  container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">Memuat konfigurasi sistem...</div>`;

  try {
    const [res, compRes, sigRes] = await Promise.all([
      api('/settings/database'),
      api('/settings/company'),
      api('/settings/signature')
    ]);
    const { navicat, tables, views, steps } = res;
    if (compRes && compRes.data) state.company = compRes.data;
    if (sigRes && sigRes.data) state.signature = sigRes.data;
    const cp = state.company || {};
    const sig = state.signature || {
      sign1_title: 'Direktur Operasional',
      sign1_name: 'Ir. H. Rahmat Hidayat',
      sign1_id: 'NIP. 19780512 200312 1 002',
      sign2_title: 'Pengelola Aset & Logistik',
      sign2_name: 'Ade Suharmin',
      sign2_id: 'NIP. 19850320 201001 1 015',
      sign_city: 'Bandung'
    };

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-header-title">Pengaturan & Identitas Perusahaan</h1>
          <p class="page-header-desc">Kelola profil identitas perusahaan, setting tanda tangan dokumen (TTD), akses Navicat, dan administrasi database.</p>
        </div>
      </div>

      <!-- Company Identity & Logo Upload Panel -->
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header">
          <div class="panel-title">${icons.master} Identitas Perusahaan & Logo Aplikasi</div>
        </div>
        <div class="panel-body">
          <form id="company-profile-form">
            <div style="display: flex; gap: 24px; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap;">
              <!-- Logo Box -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <div class="company-logo-preview-box" id="logo-preview-box">
                  ${cp.logo_url ? `<img src="${cp.logo_url}" id="company-logo-img-el" alt="Logo">` : `<div class="company-logo-placeholder">Belum Ada Logo</div>`}
                </div>
                <label class="btn btn-outline btn-sm" style="cursor: pointer;">
                  ${icons.upload} Unggah Logo
                  <input type="file" id="company-logo-file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden>
                </label>
                ${cp.logo_url ? `
                  <button type="button" class="btn btn-danger-outline btn-sm" onclick="removeCompanyLogo()">
                    Hapus Logo
                  </button>
                ` : ''}
              </div>

              <!-- Form Inputs -->
              <div style="flex: 1; min-width: 280px;" class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nama Aplikasi <span class="req">*</span></label>
                  <input type="text" id="cp-app-name" class="form-input" required value="${cp.app_name || 'Aurora Aset'}">
                </div>

                <div class="form-group">
                  <label class="form-label">Nama Perusahaan / Instansi <span class="req">*</span></label>
                  <input type="text" id="cp-company-name" class="form-input" required value="${cp.company_name || 'PT Aurora Nusantara'}">
                </div>

                <div class="form-group full">
                  <label class="form-label">Alamat Lengkap Perusahaan / Kantor</label>
                  <textarea id="cp-address" class="form-textarea" placeholder="Contoh: Jl. Merdeka No. 45, Gedung Aurora Lantai 3...">${cp.address || ''}</textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Nomor Telepon Kantor</label>
                  <input type="text" id="cp-phone" class="form-input mono" placeholder="(021) 555-8921" value="${cp.phone || ''}">
                </div>

                <div class="form-group">
                  <label class="form-label">Alamat Email Resmi</label>
                  <input type="email" id="cp-email" class="form-input" placeholder="info@aurora-aset.co.id" value="${cp.email || ''}">
                </div>

                <div class="form-group full">
                  <label class="form-label">Website Resmi Perusahaan</label>
                  <input type="text" id="cp-website" class="form-input" placeholder="www.aurora-aset.co.id" value="${cp.website || ''}">
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; padding-top: 14px; border-top: 1px solid var(--border-color);">
              <button type="submit" class="btn btn-primary">
                Simpan Identitas Perusahaan
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Setting TTD Panel -->
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header">
          <div class="panel-title">${icons.reports} Pengaturan Tanda Tangan Dokumen Laporan (Setting TTD)</div>
        </div>
        <div class="panel-body">
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
            Konfigurasikan nama pejabat penandatangan, jabatan, NIP, serta kota pengesahan yang dicantumkan secara otomatis pada seluruh lembar laporan resmi.
          </p>

          <form id="signature-settings-form">
            <div class="form-group" style="margin-bottom: 16px; max-width: 320px;">
              <label class="form-label">Kota Pengesahan / Penandatanganan <span class="req">*</span></label>
              <input type="text" id="sig-city" class="form-input" required value="${sig.sign_city || 'Bandung'}">
            </div>

            <div class="grid-two-column" style="gap: 20px; margin-bottom: 16px;">
              <!-- Kolom Pihak 1 (Kiri: Mengetahui) -->
              <div style="background: var(--bg-surface-elevated); padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 12px; color: var(--primary);">
                  Pihak 1 (Sisi Kiri - Mengetahui)
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                  <label class="form-label">Jabatan Pejabat <span class="req">*</span></label>
                  <input type="text" id="sig1-title" class="form-input" required value="${sig.sign1_title || 'Direktur Operasional'}" placeholder="Contoh: Direktur Operasional">
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                  <label class="form-label">Nama Lengkap & Gelar <span class="req">*</span></label>
                  <input type="text" id="sig1-name" class="form-input" required value="${sig.sign1_name || 'Ir. H. Rahmat Hidayat'}" placeholder="Contoh: Ir. H. Rahmat Hidayat">
                </div>
                <div class="form-group">
                  <label class="form-label">NIP / Nomor Identitas (Opsional)</label>
                  <input type="text" id="sig1-id" class="form-input mono" value="${sig.sign1_id || ''}" placeholder="Contoh: NIP. 19780512 200312 1 002">
                </div>
              </div>

              <!-- Kolom Pihak 2 (Kanan: Penyusun / Pengelola) -->
              <div style="background: var(--bg-surface-elevated); padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 12px; color: #10B981;">
                  Pihak 2 (Sisi Kanan - Penyusun / Pengelola)
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                  <label class="form-label">Jabatan Pejabat <span class="req">*</span></label>
                  <input type="text" id="sig2-title" class="form-input" required value="${sig.sign2_title || 'Pengelola Aset & Logistik'}" placeholder="Contoh: Pengelola Aset & Logistik">
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                  <label class="form-label">Nama Lengkap & Gelar <span class="req">*</span></label>
                  <input type="text" id="sig2-name" class="form-input" required value="${sig.sign2_name || 'Ade Suharmin'}" placeholder="Contoh: Ade Suharmin">
                </div>
                <div class="form-group">
                  <label class="form-label">NIP / Nomor Identitas (Opsional)</label>
                  <input type="text" id="sig2-id" class="form-input mono" value="${sig.sign2_id || ''}" placeholder="Contoh: NIP. 19850320 201001 1 015">
                </div>
              </div>
            </div>

            <!-- Pratinjau TTD Live -->
            <div style="background: var(--bg-surface); border: 1px dashed var(--border-color); padding: 16px; border-radius: var(--radius-sm); margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-subtle); margin-bottom: 8px;">Pratinjau Lembar Pengesahan Laporan:</div>
              <div id="sig-live-preview">
                ${getOfficialSignBlock()}
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; padding-top: 14px; border-top: 1px solid var(--border-color);">
              <button type="submit" class="btn btn-primary">
                Simpan Pengaturan TTD
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- SSO Integration & Link Generator Panel -->
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header">
          <div class="panel-title">${icons.master} Integrasi Link SSO (Single Sign-On)</div>
          <span class="badge badge-success">Proteksi Rute Aktif</span>
        </div>
        <div class="panel-body">
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px; line-height: 1.6;">
            Gunakan fitur ini untuk membuat <b>Tautan SSO Terenkripsi</b> resmi. Siapapun yang mengakses sistem melalui tautan SSO ini akan langsung login dan diarahkan ke Dashboard tanpa perlu mengisi username/password. Sebaliknya, siapapun yang mengakses link aplikasi biasa (meskipun mereka memiliki link seperti data aset atau laporan) <b>akan otomatis dihentikan dan diarahkan ke halaman Login</b>.
          </p>

          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 12px;">
            <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 16px;">
              <div style="flex: 1; min-width: 220px;">
                <label class="form-label" style="font-size: 12px; font-weight: 600;">Masa Berlaku Link SSO</label>
                <select id="sso-expiry-days" class="form-select">
                  <option value="1">1 Hari (24 Jam)</option>
                  <option value="7">7 Hari (1 Minggu)</option>
                  <option value="30" selected>30 Hari (1 Bulan - Direkomendasikan)</option>
                  <option value="90">90 Hari (3 Bulan)</option>
                  <option value="365">365 Hari (1 Tahun)</option>
                </select>
              </div>
              <div>
                <button type="button" class="btn btn-primary" onclick="generateSsoLink()">
                  ${icons.plus} Buat Link SSO Baru
                </button>
              </div>
            </div>

            <div id="sso-result-area" style="display: none; padding-top: 14px; border-top: 1px dashed var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <b style="font-size: 12px; color: var(--text-main);">Tautan SSO Siap Pakai:</b>
                <span id="sso-expires-label" style="font-size: 11px; color: #10B981; font-weight: 500;"></span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="sso-generated-url" class="form-input mono" readonly style="background: var(--bg-card); cursor: text; font-size: 12px; color: #60A5FA;">
                <button type="button" class="btn btn-outline btn-sm" onclick="copySsoLink()" title="Salin Link SSO">
                  ${icons.copy} Salin Link
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="testSsoLink()" title="Uji Coba di Tab Baru">
                  ${icons.eye} Buka Link
                </button>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 10px; line-height: 1.5;">
                💡 <b>Cara Menggunakan:</b> Salin dan bagikan link di atas kepada personil yang berhak atau pasang pada tombol portal internal / SSO Anda. Siapapun yang mengeklik link ini akan langsung diotentikasi ke sistem.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navicat Instructions Panel -->
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header">
          <div class="panel-title">${icons.settings} Koneksi Database Navicat (SQLite / MySQL)</div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="downloadSqliteDb()">
              ${icons.download} Unduh File .db
            </button>
            <button class="btn btn-outline btn-sm" onclick="downloadSqlDump()">
              ${icons.download} Ekspor SQL Dump
            </button>
          </div>
        </div>
        <div class="panel-body">
          <div class="navicat-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b style="color: #FFFFFF; font-size: 14px;">Lokasi File Database di Komputer Anda:</b>
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">
                  Gunakan path absolut ini pada aplikasi Navicat untuk langsung membuka seluruh skema tabel & view.
                </p>
              </div>
              <button class="btn btn-outline btn-sm" onclick="copyDbPath('${navicat.database_file.replace(/\\/g, '\\\\')}')">
                ${icons.copy} Salin Path
              </button>
            </div>
            <pre id="navicat-path-code">${navicat.database_file}</pre>
          </div>

          <h3 style="font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--text-main);">
            Langkah Cepat Membuka di Navicat for SQLite / Navicat Premium:
          </h3>
          <ol style="margin-left: 20px; font-size: 12px; color: var(--text-muted); line-height: 1.8;">
            ${steps.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>
      </div>

      <!-- Database Schema Structure Overview -->
      <div class="grid-two-column">
        <!-- Tables List -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Tabel Database Terstruktur (${tables.length})</div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>NAMA TABEL</th>
                  <th>KETERANGAN</th>
                  <th style="text-align: right;">TOTAL BARIS</th>
                </tr>
              </thead>
              <tbody>
                ${tables.map(t => `
                  <tr>
                    <td class="mono" style="color: #93C5FD; font-weight: 600;">${t.name}</td>
                    <td>${t.label}</td>
                    <td class="mono" style="text-align: right;">${t.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Views List & Admin Password -->
        <div>
          <!-- Views -->
          <div class="panel" style="margin-bottom: 20px;">
            <div class="panel-header">
              <div class="panel-title">Relational Views (Siap Pakai di Navicat)</div>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>NAMA VIEW</th>
                    <th>FUNGSI VIEW</th>
                  </tr>
                </thead>
                <tbody>
                  ${views.map(v => `
                    <tr>
                      <td class="mono" style="color: #34D399; font-weight: 600;">${v.name}</td>
                      <td>${v.label}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Change Password & Reset Demo -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">Pemeliharaan & Keamanan Akun</div>
            </div>
            <div class="panel-body">
              <form id="change-pwd-form" style="margin-bottom: 20px;">
                <div style="font-weight: 600; font-size: 12px; margin-bottom: 10px;">Ganti Password Administrator</div>
                <div class="form-group" style="margin-bottom: 10px;">
                  <input type="password" id="cp-current" class="form-input" placeholder="Password saat ini" required>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                  <input type="password" id="cp-new" class="form-input" placeholder="Password baru (minimal 6 karakter)" required>
                </div>
                <button type="submit" class="btn btn-outline btn-sm">Perbarui Password</button>
              </form>

              <div style="padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 12px; font-weight: 600;">Muat Ulang Data Contoh</div>
                  <div style="font-size: 11px; color: var(--text-subtle);">Mereset database kembali ke data default</div>
                </div>
                <button class="btn btn-danger-outline btn-sm" onclick="resetDemoConfirmation()">Reset Demo Data</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Logo file preview listener
    const logoInput = document.getElementById('company-logo-file');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const previewBox = document.getElementById('logo-preview-box');
            if (previewBox) {
              previewBox.innerHTML = `<img src="${re.target.result}" id="company-logo-img-el" alt="Preview Logo">`;
            }
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Company profile form submit
    const compForm = document.getElementById('company-profile-form');
    if (compForm) {
      compForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('app_name', document.getElementById('cp-app-name').value.trim());
        formData.append('company_name', document.getElementById('cp-company-name').value.trim());
        formData.append('address', document.getElementById('cp-address').value.trim());
        formData.append('phone', document.getElementById('cp-phone').value.trim());
        formData.append('email', document.getElementById('cp-email').value.trim());
        formData.append('website', document.getElementById('cp-website').value.trim());

        const fileInput = document.getElementById('company-logo-file');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          formData.append('logo', fileInput.files[0]);
        }

        try {
          const res = await api('/settings/company', {
            method: 'PUT',
            body: formData
          });
          showToast(res.message);
          state.company = res.data;
          updateSidebarBranding();
          renderSettingsTab(document.getElementById('tab-content-area'));
        } catch (err) {}
      });
    }

    // Signature settings form submit & live preview
    const sigForm = document.getElementById('signature-settings-form');
    if (sigForm) {
      const updateSigPreview = () => {
        const previewEl = document.getElementById('sig-live-preview');
        if (!previewEl) return;
        const tempSig = {
          sign_city: document.getElementById('sig-city')?.value || 'Bandung',
          sign1_title: document.getElementById('sig1-title')?.value || 'Direktur Operasional',
          sign1_name: document.getElementById('sig1-name')?.value || 'Ir. H. Rahmat Hidayat',
          sign1_id: document.getElementById('sig1-id')?.value || '',
          sign2_title: document.getElementById('sig2-title')?.value || 'Pengelola Aset & Logistik',
          sign2_name: document.getElementById('sig2-name')?.value || 'Ade Suharmin',
          sign2_id: document.getElementById('sig2-id')?.value || ''
        };
        const prev = state.signature;
        state.signature = tempSig;
        previewEl.innerHTML = getOfficialSignBlock();
        state.signature = prev;
      };

      ['sig-city', 'sig1-title', 'sig1-name', 'sig1-id', 'sig2-title', 'sig2-name', 'sig2-id'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', updateSigPreview);
      });

      sigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          sign_city: document.getElementById('sig-city').value.trim(),
          sign1_title: document.getElementById('sig1-title').value.trim(),
          sign1_name: document.getElementById('sig1-name').value.trim(),
          sign1_id: document.getElementById('sig1-id').value.trim(),
          sign2_title: document.getElementById('sig2-title').value.trim(),
          sign2_name: document.getElementById('sig2-name').value.trim(),
          sign2_id: document.getElementById('sig2-id').value.trim()
        };

        try {
          const res = await api('/settings/signature', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          showToast(res.message || 'Pengaturan TTD berhasil diperbarui.');
          state.signature = res.data;
          renderSettingsTab(document.getElementById('tab-content-area'));
        } catch (err) {
          showToast('Gagal menyimpan pengaturan TTD: ' + err.message, 'error');
        }
      });
    }

    // Attach password change listener
    document.getElementById('change-pwd-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const cur = document.getElementById('cp-current').value;
      const nw = document.getElementById('cp-new').value;

      try {
        const r = await api('/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({ current_password: cur, new_password: nw })
        });
        showToast(r.message);
        document.getElementById('cp-current').value = '';
        document.getElementById('cp-new').value = '';
      } catch (err) {}
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Gagal memuat pengaturan: ${err.message}</p></div>`;
  }
}

function updateSidebarBranding() {
  const brandWrapper = document.querySelector('.sidebar .brand-wrapper');
  if (brandWrapper && state.company) {
    const logoHtml = state.company.logo_url 
      ? `<img src="${state.company.logo_url}" class="brand-logo-img" alt="Logo">`
      : `<div class="brand-badge">AA</div>`;
    brandWrapper.innerHTML = `
      ${logoHtml}
      <div>
        <div class="brand-title">${state.company.app_name || 'Aurora Aset'}</div>
        <div class="brand-subtitle">${state.company.company_name || 'PT Aurora Nusantara'}</div>
      </div>
    `;
  }
  const crumbEl = document.querySelector('.topbar-breadcrumbs span:first-child');
  if (crumbEl && state.company) {
    crumbEl.innerText = (state.company.app_name || 'AURORA ASET').toUpperCase();
  }
}

async function removeCompanyLogo() {
  if (!confirm('Hapus logo perusahaan saat ini?')) return;
  try {
    const res = await api('/settings/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remove_logo: true })
    });
    showToast('Logo berhasil dihapus.');
    state.company = res.data;
    updateSidebarBranding();
    renderSettingsTab(document.getElementById('tab-content-area'));
  } catch (err) {}
}

function copyDbPath(path) {
  navigator.clipboard.writeText(path).then(() => {
    showToast('Path database berhasil disalin ke clipboard!');
  }).catch(() => {
    showToast('Gagal menyalin teks.', 'error');
  });
}

function downloadSqliteDb() {
  window.open('/api/settings/backup/sqlite', '_blank');
}

function downloadSqlDump() {
  window.open('/api/settings/export/sql', '_blank');
}

async function resetDemoConfirmation() {
  if (!confirm('Peringatan: Tindakan ini akan mengembalikan data aset, perawatan, dan master ke data awal. Lanjutkan?')) {
    return;
  }

  try {
    const res = await api('/settings/reset-demo', { method: 'POST' });
    showToast(res.message);
    await refreshMasterCache();
    renderSettingsTab(document.getElementById('tab-content-area'));
  } catch (err) {}
}

async function generateSsoLink() {
  const daysEl = document.getElementById('sso-expiry-days');
  const days = daysEl ? daysEl.value : 30;

  try {
    const res = await api('/auth/sso/generate', {
      method: 'POST',
      body: JSON.stringify({ days })
    });

    const baseUrl = window.location.origin + window.location.pathname;
    const fullSsoUrl = `${baseUrl}?sso_token=${res.sso_token}`;

    const resultArea = document.getElementById('sso-result-area');
    const inputUrl = document.getElementById('sso-generated-url');
    const expiresLabel = document.getElementById('sso-expires-label');

    if (resultArea && inputUrl) {
      inputUrl.value = fullSsoUrl;
      const expDate = new Date(res.expires_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      if (expiresLabel) {
        expiresLabel.innerText = `● Berlaku hingga: ${expDate}`;
      }
      resultArea.style.display = 'block';
    }

    showToast('Link SSO berhasil dibuat!');
  } catch (err) {
    showToast('Gagal membuat link SSO: ' + err.message, 'error');
  }
}

function copySsoLink() {
  const inputUrl = document.getElementById('sso-generated-url');
  if (inputUrl && inputUrl.value) {
    navigator.clipboard.writeText(inputUrl.value).then(() => {
      showToast('Link SSO berhasil disalin ke clipboard!');
    }).catch(() => {
      inputUrl.select();
      document.execCommand('copy');
      showToast('Link SSO berhasil disalin!');
    });
  }
}

function testSsoLink() {
  const inputUrl = document.getElementById('sso-generated-url');
  if (inputUrl && inputUrl.value) {
    window.open(inputUrl.value, '_blank');
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

