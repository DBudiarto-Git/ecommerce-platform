import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { authRepository } from '../../infrastructure/repositories/http-auth.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

const loginUseCase = new LoginUseCase(authRepository);

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isForced = searchParams.get('forced') === 'true';
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Die beiden neuen Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);
    try {
      await authRepository.changePassword(currentPassword, newPassword);
      const targetPath = user ? loginUseCase.resolveRedirectPath(user.role) : '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort konnte nicht geändert werden');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto', padding: '24px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Passwort ändern</h2>

      {isForced && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '0.9rem' }}>
          <strong>Erster Login erkannt:</strong> Bitte ersetze dein temporäres Passwort jetzt durch ein eigenes, sicheres Passwort.
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Aktuelles (temporäres) Passwort</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Neues Passwort (min. 8 Zeichen)</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Neues Passwort wiederholen</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isForced && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ flex: 1, padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Abbrechen
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 2,
              padding: '10px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isLoading ? 'Speichert...' : 'Passwort speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};
