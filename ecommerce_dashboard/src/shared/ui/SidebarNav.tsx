import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface NavTreeItem {
  id: string;
  label: string;
  icon?: string;
  children?: NavTreeItem[]; // Ermöglicht mehrstufige Button-Bäume
}

interface SidebarNavProps {
  items: NavTreeItem[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  activeItemId,
  onSelectItem,
  defaultWidth = 250,
  minWidth = 180,
  maxWidth = 450,
}) => {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const isResizing = useRef<boolean>(false);

  // Maus-Resize Start
  const startResizing = useCallback(() => {
    if (isCollapsed) return;
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [isCollapsed]);

  // Maus-Resize Bewegung & Ende
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const clampedWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth, maxWidth]);

  const toggleTreeNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Rekursive Darstellung für Buttons & Button-Baum
  const renderNavItem = (item: NavTreeItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!expandedNodes[item.id];
    const isActive = activeItemId === item.id;

    return (
      <div key={item.id}>
        <button
          type="button"
          title={isCollapsed ? item.label : undefined}
          onClick={() => {
            if (hasChildren && !isCollapsed) {
              toggleTreeNode(item.id);
            } else {
              onSelectItem(item.id);
            }
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '10px 0' : `10px 14px 10px ${14 + depth * 16}px`,
            marginBottom: '4px',
            backgroundColor: isActive ? '#2563eb' : 'transparent',
            color: isActive ? '#ffffff' : '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.9rem',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <span>{item.icon || '•'}</span>
            {!isCollapsed && (
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {item.label}
              </span>
            )}
          </span>

          {!isCollapsed && hasChildren && (
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
        </button>

        {/* Unterpunkte im Baum rendern, falls aufgeklappt */}
        {!isCollapsed && hasChildren && isExpanded && (
          <div>{item.children!.map((child) => renderNavItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const currentSidebarWidth = isCollapsed ? 56 : width;

  return (
    <aside
      style={{
        position: 'relative',
        width: `${currentSidebarWidth}px`,
        minWidth: `${currentSidebarWidth}px`,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: isResizing.current ? 'none' : 'width 0.15s ease',
      }}
    >
      {/* Kopfbereich der Sidebar mit Minimieren-Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: '12px',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {!isCollapsed && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Navigation
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? 'Navigation erweitern' : 'Navigation minimieren'}
          style={{
            padding: '4px 8px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: '#334155',
          }}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {/* Navigations-Buttons / Baum */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {items.map((item) => renderNavItem(item))}
      </nav>

      {/* Ziehbare Trennlinie (Resize-Handle) am rechten Rand der Sidebar */}
      {!isCollapsed && (
        <div
          onMouseDown={startResizing}
          title="Ziehen, um Breite anzupassen"
          style={{
            position: 'absolute',
            top: 0,
            right: -3,
            width: '6px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 10,
          }}
        />
      )}
    </aside>
  );
};
