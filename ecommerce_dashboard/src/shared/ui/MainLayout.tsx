import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};
