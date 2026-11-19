import React, { useState, useEffect, useCallback } from 'react';
import type { AdminUserItem } from '../../domain/models/auth.models';
import { authRepository } from '../../infrastructure/repositories/http-auth.repository';
import { ManageUsersUseCase } from '../../application/use-cases/manage-users.use-case';

const manageUsersUseCase = new ManageUsersUseCase(authRepository);

export const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isActive =
        statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE';
      const data = await manageUsersUseCase.loadCustomers({
        search: searchFilter,
        isActive,
      });
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Kunden');
    } finally {
      setLoading(false);
    }
  }, [searchFilter, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /*
  const handleToggleStatus = async (customer: AdminUserItem) => {
    setError(null);
    try {
      await manageUsersUseCase.setUserActiveStatus(customer.postgresUserId, !customer.isActive);
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status konnte nicht geändert werden');
    }
  };*/
  const handleToggleStatus = async (customer: AdminUserItem) => {
    setError(null);
    const nextStatus = !customer.isActive;

    try {
      await manageUsersUseCase.setUserActiveStatus(customer.postgresUserId, nextStatus);

      // Sofortige Aktualisierung der Tabelle im Frontend-State
      setCustomers((prev) =>
        prev.map((item) =>
          item.postgresUserId === customer.postgresUserId
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
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Kundenverwaltung</h2>

      {error && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Filterleiste */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nach Name, E-Mail oder Profil suchen..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ padding: '8px 12px', minWidth: '260px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
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

      {/* Kunden-Tabelle inklusive Profil-Details */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>E-Mail</th>
              <th style={{ padding: '12px' }}>Vollständiger Name</th>
              <th style={{ padding: '12px' }}>Telefon</th>
              <th style={{ padding: '12px' }}>Lieferadresse</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>Lade Kunden...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Keine Kunden gefunden.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const profile = customer.customerProfile;
                const fullName =
                  profile?.firstName || profile?.lastName
                    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
                    : customer.name || '—';

                return (
                  <tr key={customer.postgresUserId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{customer.postgresUserId}</td>
                    <td style={{ padding: '12px' }}>{customer.email}</td>
                    <td style={{ padding: '12px' }}>{fullName}</td>
                    <td style={{ padding: '12px' }}>{profile?.phone || '—'}</td>
                    <td style={{ padding: '12px' }}>{profile?.address || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: customer.isActive ? '#dcfce7' : '#fee2e2',
                          color: customer.isActive ? '#166534' : '#991b1b',
                        }}
                      >
                        {customer.isActive ? 'Aktiv' : 'Deaktiviert'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(customer)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: customer.isActive ? '#f59e0b' : '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        {customer.isActive ? 'Deaktivieren' : 'Aktivieren'}
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
