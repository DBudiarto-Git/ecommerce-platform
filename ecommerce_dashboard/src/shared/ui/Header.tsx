import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { useTheme } from '@shared/theme/ThemeContext';
import { useTranslation } from '@shared/i18n/I18nContext';

interface HeaderProps {
  /** Optionales Suchfeld oder Aktionen, die eine Seite im rechten Header einblenden kann */
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ rightContent }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: 'var(--bg-header)',
        color: 'var(--text-on-header)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {/* Linker Headerbereich */}
      <Link
        to={isAuthenticated ? '/dashboard' : '/'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          EC
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('appTitle')}</span>
      </Link>

      {/* Rechter Headerbereich */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Sprachumschalter (immer sichtbar) */}
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setLanguage('de')}
            style={{
              padding: '5px 9px',
              backgroundColor: language === 'de' ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            DE
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              padding: '5px 9px',
              backgroundColor: language === 'en' ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            EN
          </button>
        </div>

        {/* Light / Dark Theme Switch (immer sichtbar) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          style={{
            padding: '6px 10px',
            backgroundColor: '#334155',
            color: '#fff',
            border: '1px solid #475569',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        {/* Eingeloggte Benutzer-Aktionen (auf Login-Seite ausgeblendet) */}
        {isAuthenticated && user && (
          <>
            {rightContent}

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'right' }}>
              <div>{user.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {t('roleLabel')}: {user.role}
              </div>
            </div>

            <Link
              to="/change-password"
              style={{
                padding: '8px 12px',
                backgroundColor: '#334155',
                color: '#f8fafc',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {t('changePassword')}
            </Link>

            <button
              type="button"
              onClick={logout}
              style={{
                padding: '8px 14px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.85rem',
              }}
            >
              {t('logout')}
            </button>
          </>
        )}
      </div>
    </header>
  );
};

