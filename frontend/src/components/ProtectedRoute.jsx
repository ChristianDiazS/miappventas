import { Navigate } from 'react-router-dom';
import { AccessDenied } from '../pages/AccessDenied';

export function ProtectedRoute({ children, requiredRole = 'ADMIN' }) {
  // Obtener el usuario del localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene el rol requerido, mostrar acceso denegado
  if (user.role !== requiredRole && user.role !== 'SUPERADMIN') {
    return <AccessDenied />;
  }

  // Si todo está bien, mostrar el componente
  return children;
}
