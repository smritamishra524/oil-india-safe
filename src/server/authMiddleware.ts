import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin, ViteDevServer, PreviewServer } from 'vite';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthStore {
  users: UserRecord[];
  sessions: SessionRecord[];
  resetTokens: Record<string, { token: string; expiresAt: string }>;
}

const AUTH_FILE_DIR = path.resolve(process.cwd(), 'src/data');
const AUTH_FILE_PATH = path.join(AUTH_FILE_DIR, 'auth_store.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getInitialStore(): AuthStore {
  const salt1 = generateSalt();
  const salt2 = generateSalt();

  const seedUsers: UserRecord[] = [
    {
      id: 'usr-oil-001',
      name: 'R. K. Barua',
      email: 'rk.barua@oilindia.in',
      role: 'Chief HSE Manager',
      organization: 'Oil India Limited (Duliajan HQ)',
      passwordHash: hashPassword('OilIndia@2026', salt1),
      salt: salt1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-oil-002',
      name: 'SIH Evaluator',
      email: 'evaluator@oilindia.in',
      role: 'Lead Safety Assessor',
      organization: 'Oil India Corporate Directorate',
      passwordHash: hashPassword('OilIndia@2026', salt2),
      salt: salt2,
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users: seedUsers,
    sessions: [],
    resetTokens: {}
  };
}

function loadStore(): AuthStore {
  try {
    if (!fs.existsSync(AUTH_FILE_DIR)) {
      fs.mkdirSync(AUTH_FILE_DIR, { recursive: true });
    }
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const data = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[AuthMiddleware] Error reading auth store, initializing defaults:', err);
  }

  const initial = getInitialStore();
  saveStore(initial);
  return initial;
}

function saveStore(store: AuthStore): void {
  try {
    if (!fs.existsSync(AUTH_FILE_DIR)) {
      fs.mkdirSync(AUTH_FILE_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AuthMiddleware] Error saving auth store:', err);
  }
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

export function authMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): void {
  const url = req.url || '';
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  if (!url.startsWith('/api/auth/')) {
    next();
    return;
  }

  const route = url.split('?')[0];

  // 1. SIGN IN
  if (route === '/api/auth/signin' && req.method === 'POST') {
    parseJsonBody(req)
      .then(body => {
        const { email, password } = body;
        if (!email || !password) {
          sendJson(res, 400, { error: 'Email and password are required.' });
          return;
        }

        const store = loadStore();
        const user = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) {
          sendJson(res, 401, { error: 'Invalid credentials. User does not exist.' });
          return;
        }

        const testHash = hashPassword(password, user.salt);
        if (testHash !== user.passwordHash) {
          sendJson(res, 401, { error: 'Invalid email or password.' });
          return;
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        store.sessions.push({
          token,
          userId: user.id,
          createdAt: new Date().toISOString(),
          expiresAt
        });
        saveStore(store);

        sendJson(res, 200, {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization
          }
        });
      })
      .catch(err => {
        sendJson(res, 400, { error: err.message || 'Malformed request body' });
      });
    return;
  }

  // 2. SIGN UP
  if (route === '/api/auth/signup' && req.method === 'POST') {
    parseJsonBody(req)
      .then(body => {
        const { name, email, password, role, organization } = body;
        if (!name || !email || !password) {
          sendJson(res, 400, { error: 'Full name, email, and password are required.' });
          return;
        }

        if (password.length < 6) {
          sendJson(res, 400, { error: 'Password must be at least 6 characters.' });
          return;
        }

        const store = loadStore();
        const normalizedEmail = email.trim().toLowerCase();
        if (store.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
          sendJson(res, 409, { error: 'An account with this email address already exists.' });
          return;
        }

        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const newUser: UserRecord = {
          id: `usr-oil-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          name: name.trim(),
          email: normalizedEmail,
          role: role?.trim() || 'HSE Operations Officer',
          organization: organization?.trim() || 'Oil India Limited (Assam Asset)',
          passwordHash,
          salt,
          createdAt: new Date().toISOString()
        };

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        store.users.push(newUser);
        store.sessions.push({
          token,
          userId: newUser.id,
          createdAt: new Date().toISOString(),
          expiresAt
        });
        saveStore(store);

        sendJson(res, 201, {
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            organization: newUser.organization
          }
        });
      })
      .catch(err => {
        sendJson(res, 400, { error: err.message || 'Malformed request' });
      });
    return;
  }

  // 3. SESSION RESTORATION / VERIFICATION
  if (route === '/api/auth/session' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      sendJson(res, 401, { error: 'No authorization token provided.' });
      return;
    }

    const store = loadStore();
    const session = store.sessions.find(s => s.token === token);
    if (!session) {
      sendJson(res, 401, { error: 'Invalid or expired session token.' });
      return;
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      store.sessions = store.sessions.filter(s => s.token !== token);
      saveStore(store);
      sendJson(res, 401, { error: 'Session expired. Please sign in again.' });
      return;
    }

    const user = store.users.find(u => u.id === session.userId);
    if (!user) {
      sendJson(res, 401, { error: 'User record not found.' });
      return;
    }

    sendJson(res, 200, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
      }
    });
    return;
  }

  // 4. LOGOUT
  if (route === '/api/auth/logout' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const store = loadStore();
    if (token) {
      store.sessions = store.sessions.filter(s => s.token !== token);
      saveStore(store);
    }
    sendJson(res, 200, { success: true, message: 'Session logged out successfully.' });
    return;
  }

  // 5. FORGOT PASSWORD (REQUEST RESET CODE)
  if (route === '/api/auth/forgot-password' && req.method === 'POST') {
    parseJsonBody(req)
      .then(body => {
        const { email } = body;
        if (!email) {
          sendJson(res, 400, { error: 'Email is required.' });
          return;
        }

        const store = loadStore();
        const user = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) {
          sendJson(res, 404, { error: 'No account registered with this email address.' });
          return;
        }

        // Generate a 6-digit verification reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

        store.resetTokens[user.email.toLowerCase()] = {
          token: resetCode,
          expiresAt
        };
        saveStore(store);

        sendJson(res, 200, {
          success: true,
          message: 'Password reset code generated.',
          resetCode // Returned directly for frictionless testing and verification
        });
      })
      .catch(err => {
        sendJson(res, 400, { error: err.message || 'Malformed request' });
      });
    return;
  }

  // 6. RESET PASSWORD
  if (route === '/api/auth/reset-password' && req.method === 'POST') {
    parseJsonBody(req)
      .then(body => {
        const { email, resetCode, newPassword } = body;
        if (!email || !resetCode || !newPassword) {
          sendJson(res, 400, { error: 'Email, reset code, and new password are required.' });
          return;
        }

        if (newPassword.length < 6) {
          sendJson(res, 400, { error: 'New password must be at least 6 characters.' });
          return;
        }

        const store = loadStore();
        const normalizedEmail = email.trim().toLowerCase();
        const storedReset = store.resetTokens[normalizedEmail];

        if (!storedReset || storedReset.token !== resetCode.trim()) {
          sendJson(res, 400, { error: 'Invalid or expired password reset code.' });
          return;
        }

        if (new Date(storedReset.expiresAt).getTime() < Date.now()) {
          delete store.resetTokens[normalizedEmail];
          saveStore(store);
          sendJson(res, 400, { error: 'Reset code has expired. Please request a new one.' });
          return;
        }

        const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (!user) {
          sendJson(res, 404, { error: 'User not found.' });
          return;
        }

        const newSalt = generateSalt();
        user.salt = newSalt;
        user.passwordHash = hashPassword(newPassword, newSalt);

        delete store.resetTokens[normalizedEmail];
        // Invalidate all prior sessions for this user on password reset
        store.sessions = store.sessions.filter(s => s.userId !== user.id);
        saveStore(store);

        sendJson(res, 200, {
          success: true,
          message: 'Password has been successfully updated. You may now sign in with your new credentials.'
        });
      })
      .catch(err => {
        sendJson(res, 400, { error: err.message || 'Malformed request' });
      });
    return;
  }

  next();
}

export function authApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-oil-auth-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(authMiddleware);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(authMiddleware);
    }
  };
}
