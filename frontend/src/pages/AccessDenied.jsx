import { Link } from 'react-router-dom';
import { Button } from '../components/Common/Button';

export function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Solo los administradores pueden acceder al panel de administración.
          </p>
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, por favor contacta al soporte.
          </p>
        </div>

        <Link to="/">
          <Button className="w-full">
            Volver a Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
