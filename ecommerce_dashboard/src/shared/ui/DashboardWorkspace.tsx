import React from 'react';
import { SidebarNav } from './SidebarNav';
import type { NavTreeItem } from './SidebarNav';

interface DashboardWorkspaceProps {
  navItems: NavTreeItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  children: React.ReactNode;
}

export const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({
  navItems,
  activeNavId,
  onSelectNav,
  children,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 'calc(100vh - 61px)', // Volle Höhe abzüglich Header
        width: '100%',
      }}
    >
      {/* Spalte 1: Schmalere, resizable & minimierbare Navigation */}
      <SidebarNav
        items={navItems}
        activeItemId={activeNavId}
        onSelectItem={onSelectNav}
      />

      {/* Spalte 2: Hauptbereich für tatsächlichen Inhalt (Benutzer, Katalog, Statistiken...) */}
      <section
        style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        {children}
      </section>
    </div>
  );
};
