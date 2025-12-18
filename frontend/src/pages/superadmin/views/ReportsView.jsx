import React, { useState } from 'react';
import { Calendar, Download, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const ReportsView = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams(dateRange);
      const response = await fetch(
        `http://localhost:3001/api/superadmin/reports?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      setReports(data);
      setError(null);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Reportes</h2>
        <p className="text-gray-400 mt-1">Análisis de ventas y desempeño</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center space-x-2">
          <Calendar size={20} />
          <span>Rango de Fechas</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Report Content */}
      {reports && (
        <div className="space-y-6">
          {/* Daily Revenue Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Ingresos Diarios</h3>
              <button className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                <Download size={18} />
                <span className="text-sm">Descargar</span>
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(reports.dailyRevenue || {})
                .sort()
                .map(([date, revenue]) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-gray-400">{new Date(date).toLocaleDateString('es-ES')}</span>
                    <span className="text-cyan-400 font-bold">S/. {(revenue / 100).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Clientes</h3>
            <div className="space-y-4">
              {reports.topCustomers?.map((customer, idx) => (
                <div
                  key={customer.userId}
                  className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{customer.name}</p>
                      <p className="text-gray-400 text-sm">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">S/. {(customer.totalSpent / 100).toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">{customer.orders} órdenes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reports && !loading && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">Selecciona un rango de fechas para generar un reporte</p>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
