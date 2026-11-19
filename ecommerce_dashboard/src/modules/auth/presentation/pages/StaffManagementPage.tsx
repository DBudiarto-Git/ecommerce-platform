import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@shared/auth/AuthContext';
import type { RoleOption } from '@shared/auth/auth-types';
import type { AdminUserItem } from '../../domain/models/auth.models';
import { authRepository } from '../../infrastructure/repositories/http-auth.repository';
import { ManageUsersUseCase } from '../../application/use-cases/manage-users.use-case';

const manageUsersUseCase = new ManageUsersUseCase(authRepository);

export const StaffManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter-States
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Formular-States für neuen Mitarbeiter
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isActive =
        statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE';
      const data = await manageUsersUseCase.loadStaff({
        search: searchFilter,
        roleName: roleFilter || undefined,
        isActive,
      });
      setStaffList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Mitarbeiter');
    } finally {
      setLoading(false);
    }
  }, [searchFilter, roleFilter, statusFilter]);

  useEffect(() => {
    manageUsersUseCase
      .getStaffRoles()
      .then((loadedRoles) => {
        setRoles(loadedRoles);
        if (loadedRoles.length > 0 && !newRole) {
          setNewRole(loadedRoles[0].name);
        }
      })
      .catch(() => setError('Rollen konnten nicht geladen werden'));
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const createdStaff = await manageUsersUseCase.createStaff({
        email: newEmail,
        name: newName || undefined,
        roleName: newRole,
        isActive: newIsActive,
      });

      // Neuen Mitarbeiter sofort live oben in die Tabelle einfügen
      setStaffList((prev) => [createdStaff, ...prev]);

      setNewEmail('');
      setNewName('');
      setNewIsActive(true);
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mitarbeiter konnte nicht erstellt werden');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (staff: AdminUserItem) => {
    setError(null);
    const nextStatus = !staff.isActive;

    try {
      await manageUsersUseCase.setUserActiveStatus(staff.postgresUserId, nextStatus);

      // Sofortige Aktualisierung der Mitarbeiter-Tabelle im Frontend-State
      setStaffList((prev) =>
        prev.map((item) =>
          item.postgresUserId === staff.postgresUserId
            ? { ...item, isActive: nextStatus }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status konnte nicht geändert werden');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Mitarbeiterverwaltung</h2>
        <button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {showCreateForm ? 'Formular schließen' : '+ Neuer Mitarbeiter'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Anlage-Formular für neue Mitarbeiter */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateStaff}
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Max Mustermann"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>E-Mail *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="mitarbeiter@shop.at"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            Das Passwort wird automatisch generiert und per E-Mail versendet.
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Rolle *</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
            <input
              id="newIsActive"
              type="checkbox"
              checked={newIsActive}
              onChange={(e) => setNewIsActive(e.target.checked)}
            />
            <label htmlFor="newIsActive" style={{ fontSize: '0.9rem' }}>Sofort aktiv</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                width: '100%',
                padding: '9px',
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {creating ? 'Speichert...' : 'Mitarbeiter anlegen'}
            </button>
          </div>
        </form>
      )}

      {/* Filterleiste */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nach Name oder E-Mail suchen..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ padding: '8px 12px', minWidth: '240px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="">Alle Mitarbeiter-Rollen</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">Alle Status</option>
          <option value="ACTIVE">Nur Aktive</option>
          <option value="INACTIVE">Nur Deaktivierte</option>
        </select>
      </div>

      {/* Mitarbeiter-Tabelle */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>E-Mail</th>
              <th style={{ padding: '12px' }}>Rolle</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>Lade Mitarbeiter...</td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Keine Mitarbeiter gefunden.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => {
                const isSelf = staff.postgresUserId === currentUser?.id;
                return (
                  <tr key={staff.postgresUserId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{staff.postgresUserId}</td>
                    <td style={{ padding: '12px' }}>{staff.name || '—'}</td>
                    <td style={{ padding: '12px' }}>{staff.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {staff.roleName}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: staff.isActive ? '#dcfce7' : '#fee2e2',
                          color: staff.isActive ? '#166534' : '#991b1b',
                        }}
                      >
                        {staff.isActive ? 'Aktiv' : 'Deaktiviert'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        type="button"
                        disabled={isSelf}
                        title={isSelf ? 'Eigenes Konto kann nicht deaktiviert werden' : undefined}
                        onClick={() => handleToggleStatus(staff)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: isSelf ? '#cbd5e1' : staff.isActive ? '#f59e0b' : '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isSelf ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        {staff.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

