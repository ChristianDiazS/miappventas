import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const AuditLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`http://localhost:3001/api/superadmin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch audit logs');

      const data = await response.json();
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('created')) return 'text-green-400';
    if (action.includes('updated')) return 'text-blue-400';
    if (action.includes('deleted')) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Auditoría</h2>
        <p className="text-gray-400 mt-1">Registro de todas las actividades del sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-white font-semibold">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Acción (ej: admin_created)"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Usuario</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Acción</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Entidad</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Fecha</th>
              <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-700 transition-colors duration-200">
                <td className="px-6 py-4 text-white text-sm">{log.user?.email}</td>
                <td className={`px-6 py-4 text-sm font-mono ${getActionColor(log.action)}`}>
                  {log.action}
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">{log.entity}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(log.createdAt).toLocaleString('es-ES')}
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {log.newData && (
                    <details>
                      <summary className="cursor-pointer text-cyan-400">Ver cambios</summary>
                      <pre className="text-xs mt-2 bg-gray-700 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(log.newData, null, 2)}
                      </pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No hay registros de auditoría</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsView;
