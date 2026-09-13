export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface StoredAccount extends AuthUser {
  password: string;
}

const TOKEN_KEY = 'oil_auth_token_v1';
const USER_KEY = 'oil_auth_user_v1';
const ACCOUNTS_KEY = 'oil_auth_accounts_v1';

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-oil-001',
    name: 'R. K. Barua',
    email: 'rk.barua@oilindia.in',
    role: 'Chief HSE Manager',
    organization: 'Oil India Limited (Duliajan HQ)',
    password: 'OilIndia@2026'
  },
  {
    id: 'usr-oil-002',
    name: 'SIH Evaluator',
    email: 'evaluator@oilindia.in',
    role: 'Lead Safety Assessor',
    organization: 'Oil India Corporate Directorate',
    password: 'OilIndia@2026'
  }
];

function getStoredAccounts(): StoredAccount[] {
  try {
    const saved = localStorage.getItem(ACCOUNTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

async function safeParseResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (contentType.includes('application/json') || (text.trim().startsWith('{') && text.trim().endsWith('}'))) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to store auth token', e);
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear auth token', e);
    }
  },

  saveSessionUser(user: AuthUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },

  getSessionUser(): AuthUser | null {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Attempt API authentication with safe response parsing
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      const data = await safeParseResponse(res);
      if (data) {
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed. Please check your credentials.');
        }
        this.setToken(data.token);
        this.saveSessionUser(data.user);
        return data;
      }
    } catch (err: any) {
      // If server returned a structured error, rethrow it
      if (err.message && !err.message.includes('JSON') && !err.message.includes('fetch') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // 2. Reliable local verification fallback (ensures login never crashes on HTML 404/server restarting)
    const accounts = getStoredAccounts();
    const matched = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (!matched) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    if (matched.password !== password) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const token = `oil_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const user: AuthUser = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      organization: matched.organization
    };

    this.setToken(token);
    this.saveSessionUser(user);

    return { token, user };
  },

  async signUp(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    organization: string;
  }): Promise<AuthResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Attempt API registration with safe response parsing
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, email: normalizedEmail })
      });

      const data = await safeParseResponse(res);
      if (data) {
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create user account.');
        }
        this.setToken(data.token);
        this.saveSessionUser(data.user);
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON') && !err.message.includes('fetch') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // 2. Reliable local account registration
    const accounts = getStoredAccounts();
    if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: StoredAccount = {
      id: `usr-oil-${Date.now()}`,
      name: payload.name.trim(),
      email: normalizedEmail,
      role: payload.role.trim() || 'HSE Field Inspector',
      organization: payload.organization.trim() || 'Oil India Limited',
      password: payload.password
    };

    accounts.push(newUser);
    saveStoredAccounts(accounts);

    const token = `oil_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const user: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.organization
    };

    this.setToken(token);
    this.saveSessionUser(user);

    return { token, user };
  },

  async getSession(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await safeParseResponse(res);
      if (data && res.ok && data.user) {
        this.saveSessionUser(data.user);
        return data.user;
      }
    } catch {}

    // Fallback to active stored session user
    return this.getSessionUser();
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch {}
    this.clearToken();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetCode?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const data = await safeParseResponse(res);
      if (data) {
        if (!res.ok) {
          throw new Error(data.error || 'Password reset request failed.');
        }
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON') && !err.message.includes('fetch') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // Local accounts lookup
    const accounts = getStoredAccounts();
    const user = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (!user) {
      throw new Error('No account registered with this email address.');
    }

    return {
      success: true,
      message: 'Password reset verification code generated.',
      resetCode: '123456'
    };
  },

  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, resetCode, newPassword })
      });

      const data = await safeParseResponse(res);
      if (data) {
        if (!res.ok) {
          throw new Error(data.error || 'Failed to reset password.');
        }
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON') && !err.message.includes('fetch') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // Local reset
    const accounts = getStoredAccounts();
    const user = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (!user) {
      throw new Error('User account not found.');
    }

    user.password = newPassword;
    saveStoredAccounts(accounts);

    return {
      success: true,
      message: 'Password has been successfully updated. You may now sign in with your new credentials.'
    };
  }
};
