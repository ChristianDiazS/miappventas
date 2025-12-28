import React, { useState, useEffect } from 'react';
import {
  BarChart3, Package, ShoppingCart, Users, TrendingUp, AlertCircle,
  Activity, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: [],
    outOfStockProducts: [],
    recentOrders: [],
    systemHealth: {
      status: 'healthy',
      message: 'Sistema funcionando correctamente'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch products
      const productsRes = await fetch('http://localhost:5000/api/products/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const products = await productsRes.json();

      // Fetch categories
      const categoriesRes = await fetch('http://localhost:5000/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const categories = await categoriesRes.json();

      // Fetch orders
      const ordersRes = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orders = await ordersRes.json();

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = usersRes.ok ? await usersRes.json() : [];

      // Calculate low stock
      const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
      const outOfStockProducts = products.filter(p => p.stock === 0);

      // Get recent orders
      const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

      setDashboardData({
        totalProducts: products.length,
        totalCategories: categories.length || 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        lowStockProducts,
        outOfStockProducts,
        recentOrders,
        systemHealth: {
          status: outOfStockProducts.length > 5 ? 'warning' : 'healthy',
          message: outOfStockProducts.length > 5 
            ? `${outOfStockProducts.length} productos sin stock`
            : 'Sistema funcionando correctamente'
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Productos Totales',
      value: dashboardData.totalProducts,
      icon: Package,
      bgColor: 'from-blue-100 to-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      title: 'Categorías',
      value: dashboardData.totalCategories,
      icon: BarChart3,
      bgColor: 'from-green-100 to-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      title: 'Órdenes Totales',
      value: dashboardData.totalOrders,
      icon: ShoppingCart,
      bgColor: 'from-purple-100 to-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      title: 'Usuarios',
      value: dashboardData.totalUsers,
      icon: Users,
      bgColor: 'from-orange-100 to-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
        <p className="text-gray-600">Bienvenido {user?.email}</p>
      </div>

      {/* System Health */}
      <div className={`p-4 rounded-lg border-l-4 ${
        dashboardData.systemHealth.status === 'healthy'
          ? 'bg-green-50 border-green-400'
          : 'bg-yellow-50 border-yellow-400'
      }`}>
        <div className="flex items-center gap-3">
          {dashboardData.systemHealth.status === 'healthy' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <span className={dashboardData.systemHealth.status === 'healthy' ? 'text-green-700' : 'text-yellow-700'}>
            {dashboardData.systemHealth.message}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} p-6 rounded-lg border ${stat.borderColor} shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 font-semibold text-sm mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.textColor} opacity-20`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        {dashboardData.lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-yellow-900">⚠️ Stock Bajo ({dashboardData.lowStockProducts.length})</h3>
            </div>
            <div className="space-y-3">
              {dashboardData.lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded border border-yellow-100">
                  <span className="font-semibold text-sm">{product.title}</span>
                  <span className="text-yellow-700 font-bold text-sm">{product.stock} unidades</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Out of Stock */}
        {dashboardData.outOfStockProducts.length > 0 && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">🚨 Sin Stock ({dashboardData.outOfStockProducts.length})</h3>
            </div>
            <div className="space-y-3">
              {dashboardData.outOfStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded border border-red-100">
                  <span className="font-semibold text-sm">{product.title}</span>
                  <span className="text-red-700 font-bold text-sm">Sin stock</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {dashboardData.recentOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Órdenes Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{order.id?.toString().slice(-6)}</td>
                    <td className="px-4 py-2">{order.user?.email || 'Desconocido'}</td>
                    <td className="px-4 py-2 font-bold">S/ {parseFloat(order.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
