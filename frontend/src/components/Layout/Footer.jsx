import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Sección 1 */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-400 hover:text-white">Laptops</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white">Monitores</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white">Accesorios</Link></li>
            </ul>
          </div>

          {/* Sección 2 */}
          <div>
            <h3 className="text-lg font-bold mb-4">Información</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Sobre Nosotros</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Términos & Condiciones</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacidad</a></li>
            </ul>
          </div>

          {/* Sección 3 */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: info@miappventas.com</li>
              <li className="text-gray-400">Tel: +51 999 999 999</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400">
            © 2025 MiAppVentas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}