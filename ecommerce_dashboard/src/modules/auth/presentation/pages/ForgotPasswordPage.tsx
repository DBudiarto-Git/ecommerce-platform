import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authRepository } from '../../infrastructure/repositories/http-auth.repository';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await authRepository.requestPasswordReset(email);
      setSuccessMessage(response.message);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anfrage fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Passwort vergessen</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
        Gib deine geschäftliche E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts zu.
      </p>

      {successMessage && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '0.9rem' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>E-Mail-Adresse</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@shop.at"
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
            marginBottom: '16px',
          }}
        >
          {isLoading ? 'Wird gesendet...' : 'Reset-Link anfordern'}
        </button>
      </form>

      <Link to="/" style={{ color: '#2563eb', fontSize: '0.9rem' }}>
        ← Zurück zum Login
      </Link>
    </div>
  );
};

