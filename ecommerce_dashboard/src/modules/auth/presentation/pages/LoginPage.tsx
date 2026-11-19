import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { authRepository } from '../../infrastructure/repositories/http-auth.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { useTranslation } from '@shared/i18n/I18nContext';

const loginUseCase = new LoginUseCase(authRepository);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); 
  const { isAuthenticated, user, loginWithToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Falls bereits eingeloggt, sofort an das passende Dashboard weiterleiten
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(loginUseCase.resolveRedirectPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { accessToken, redirectPath } = await loginUseCase.execute({
        email,
        password,
      });

      loginWithToken(accessToken);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{t('loginTitle')}</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Bitte melde dich mit deinen Zugangsdaten an. Neue Zugänge werden ausschließlich durch einen Administrator erstellt.
      </p>

      {error && (
        <div style={{ padding: '10px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@shop.at"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
            Passwort
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2563eb' }}>
            Passwort vergessen?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Anmeldung läuft...' : 'Einloggen'}
        </button>
      </form>
    </div>
  );
};
