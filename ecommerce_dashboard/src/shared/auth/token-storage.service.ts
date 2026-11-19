import type { AuthUser, AppRole } from './auth-types';

const TOKEN_STORAGE_KEY = 'ecommerce_admin_token';

interface RawJwtPayload {
  sub: number;
  email: string;
  role: AppRole;
  exp?: number;
}

class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  decodeUserFromToken(token: string): AuthUser | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );

      const payload = JSON.parse(jsonPayload) as RawJwtPayload;

      // Prüfen, ob das Token bereits abgelaufen ist
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.removeToken();
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      this.removeToken();
      return null;
    }
  }
}

export const tokenStorage = new TokenStorageService();
