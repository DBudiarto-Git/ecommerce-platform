import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@shared/auth/AuthContext';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';
import { MainLayout } from '@shared/ui/MainLayout';
import { DashboardWorkspace } from '@shared/ui/DashboardWorkspace';
import type { NavTreeItem } from '@shared/ui/SidebarNav';
import { LoginPage } from '@modules/auth/presentation/pages/LoginPage';
import { ForgotPasswordPage } from '@modules/auth/presentation/pages/ForgotPasswordPage';
import { StaffManagementPage } from '@modules/auth/presentation/pages/StaffManagementPage';
import { CustomerManagementPage } from '@modules/auth/presentation/pages/CustomerManagementPage';
import { ChangePasswordPage } from '@modules/auth/presentation/pages/ChangePasswordPage';
import { ResetPasswordPage } from '@modules/auth/presentation/pages/ResetPasswordPage';
import { ThemeProvider } from '@shared/theme/ThemeContext';
import { I18nProvider } from '@shared/i18n/I18nContext';

const ManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  //const { t } = useTranslation();

  const navItems: NavTreeItem[] = [
    { id: 'overview', label: 'Übersicht & Statistiken', icon: '📊' },
    {
      id: 'catalog-group',
      label: 'Produkt-Katalog',
      icon: '📦',
      children: [
        { id: 'products', label: 'Produkte verwalten', icon: '🏷️' },
        { id: 'categories', label: 'Kategorien', icon: '📂' },
      ],
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            id: 'users-group',
            label: 'Benutzerverwaltung',
            icon: '👥',
            children: [
              { id: 'users-staff', label: 'Mitarbeiter', icon: '👔' },
              { id: 'users-customers', label: 'Kunden', icon: '🛒' },
            ],
          },
        ]
      : []),
  ];

  return (
    <DashboardWorkspace
      navItems={navItems}
      activeNavId={activeSection}
      onSelectNav={setActiveSection}
    >
      {activeSection === 'overview' && <h2>Statistiken & Insights</h2>}
      {activeSection === 'products' && <h2>Produkt-Katalog</h2>}
      {activeSection === 'categories' && <h2>Kategorien</h2>}
      {activeSection === 'users-staff' && <StaffManagementPage />}
      {activeSection === 'users-customers' && <CustomerManagementPage />}
    </DashboardWorkspace>
  );
};

const PackerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('open-orders');

  const packerNavItems: NavTreeItem[] = [
    { id: 'open-orders', label: 'Offene Bestellungen', icon: '📋' },
    { id: 'packed-orders', label: 'Versandbereit', icon: '📦' },
  ];

  return (
    <DashboardWorkspace
      navItems={packerNavItems}
      activeNavId={activeSection}
      onSelectNav={setActiveSection}
    >
      {activeSection === 'open-orders' && <h2>Offene Bestellungen zum Verpacken</h2>}
      {activeSection === 'packed-orders' && <h2>Bereits verpackte Sendungen</h2>}
    </DashboardWorkspace>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/change-password" element={<ChangePasswordPage />} />
                </Route>

                {/* Zielseite 1: Dashboard für ADMIN, MANAGER, GUEST */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'GUEST']} />}>
                  <Route path="/dashboard" element={<ManagementDashboard />} />
                </Route>

                {/* Zielseite 2: Dashboard speziell für PACKER */}
                <Route element={<ProtectedRoute allowedRoles={['PACKER']} />}>
                  <Route path="/packer-dashboard" element={<PackerDashboard />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
