import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react';
import StatCard from '../../../components/Common/StatCard';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const DashboardView = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/superadmin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 flex items-center space-x-3">
        <AlertCircle className="text-red-400" size={24} />
        <div>
          <h3 className="text-red-200 font-bold">Error cargando dashboard</h3>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { summary, thisMonth, last30Days, topProducts, paymentsByMethod, ordersByStatus } = stats || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Estadísticas en tiempo real de la plataforma</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios Totales"
          value={summary?.totalUsers}
          icon={Users}
          subtitle={`${summary?.activeUsers} activos`}
          color="cyan"
        />
        <StatCard
          title="Órdenes Totales"
          value={summary?.totalOrders}
          icon={ShoppingCart}
          subtitle={`${thisMonth?.orders} este mes`}
          color="blue"
        />
        <StatCard
          title="Ingresos Totales"
          value={`S/. ${(summary?.totalRevenue / 100).toFixed(2)}`}
          icon={DollarSign}
          subtitle={`S/. ${(thisMonth?.revenue / 100).toFixed(2)} este mes`}
          color="emerald"
        />
        <StatCard
          title="Ticket Promedio"
          value={`S/. ${(summary?.avgOrderValue / 100).toFixed(2)}`}
          icon={TrendingUp}
          subtitle="Por orden"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top 5 Productos</h3>
          <div className="space-y-4">
            {topProducts?.map((product, idx) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.title}</p>
                    <p className="text-gray-400 text-sm">{product.sales} ventas</p>
                  </div>
                </div>
                <p className="text-cyan-400 font-bold">S/. {(product.revenue / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Estado de Órdenes</h3>
          <div className="space-y-4">
            {ordersByStatus?.map((status) => {
              const totalOrders = ordersByStatus.reduce((sum, s) => sum + s._count, 0);
              const percentage = ((status._count / totalOrders) * 100).toFixed(1);

              return (
                <div key={status.status}>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-300 text-sm">{status.status}</p>
                    <p className="text-cyan-400 text-sm font-bold">
                      {status._count} ({percentage}%)
                    </p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Métodos de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentsByMethod?.map((method) => (
            <div key={method.provider} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm font-medium capitalize">{method.provider}</p>
              <p className="text-2xl font-bold text-cyan-400 mt-2">{method._count}</p>
              <p className="text-gray-400 text-xs mt-1">
                S/. {(method._sum.amount / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Last Update */}
      <p className="text-gray-500 text-xs text-right">
        Última actualización: {new Date().toLocaleString('es-ES')}
      </p>
    </div>
  );
};

export default DashboardView;
