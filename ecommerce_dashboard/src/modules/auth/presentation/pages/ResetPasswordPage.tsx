import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authRepository } from '../../infrastructure/repositories/http-auth.repository';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Kein gültiger Reset-Token in der URL gefunden.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Die beiden Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authRepository.resetPassword(token, newPassword);
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zurücksetzen fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Neues Passwort festlegen</h2>

      {successMessage ? (
        <div>
          <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px' }}>
            {successMessage}
          </div>
          <Link
            to="/"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            Jetzt zum Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '10px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
              {error}
            </div>
          )}

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
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Passwort wiederholen</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
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
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isLoading ? 'Speichert...' : 'Passwort speichern'}
          </button>
        </form>
      )}
    </div>
  );
};
