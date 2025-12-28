import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Política de Privacidad
        </h1>
        <p className="text-gray-500 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <nav className="mb-8 bg-gray-100 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Contenido:</p>
          <ul className="text-sm space-y-1">
            <li><a href="#intro" className="text-blue-600 hover:underline">1. Introducción</a></li>
            <li><a href="#datos" className="text-blue-600 hover:underline">2. Datos que Recopilamos</a></li>
            <li><a href="#uso" className="text-blue-600 hover:underline">3. Cómo Usamos tus Datos</a></li>
            <li><a href="#seguridad" className="text-blue-600 hover:underline">4. Seguridad de Datos</a></li>
            <li><a href="#derechos" className="text-blue-600 hover:underline">5. Tus Derechos</a></li>
            <li><a href="#cookies" className="text-blue-600 hover:underline">6. Cookies</a></li>
            <li><a href="#terceros" className="text-blue-600 hover:underline">7. Servicios de Terceros</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">8. Contacto</a></li>
          </ul>
        </nav>

        <div className="space-y-6">
          <section id="intro">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introducción</h2>
            <p className="text-gray-700">
              Un Poquito Variado respeta tu privacidad y está comprometido a proteger tus datos personales. 
              Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos tu información.
            </p>
          </section>

          <section id="datos">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Datos que Recopilamos</h2>
            <p className="text-gray-700 mb-3">
              <strong>Datos de Registro:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Contraseña (hasheada, nunca en texto plano)</li>
              <li>Número de teléfono</li>
              <li>Dirección de envío</li>
            </ul>

            <p className="text-gray-700 mb-3">
              <strong>Datos de Compra:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
              <li>Historial de órdenes</li>
              <li>Productos comprados</li>
              <li>Cantidad de dinero gastado</li>
              <li>Fecha y hora de compra</li>
            </ul>

            <p className="text-gray-700 mb-3">
              <strong>Datos de Pago:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
              <li>Números de tarjeta (procesados por Izipay, no almacenados por nosotros)</li>
              <li>Fecha de expiración (procesada por Izipay)</li>
              <li>Dirección de facturación</li>
            </ul>

            <p className="text-gray-700">
              <strong>Datos Técnicos:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Dirección IP</li>
              <li>Tipo de navegador</li>
              <li>Sistema operativo</li>
              <li>Páginas visitadas</li>
              <li>Hora de acceso</li>
            </ul>
          </section>

          <section id="uso">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Cómo Usamos tus Datos</h2>
            <p className="text-gray-700 mb-3">Usamos tus datos para:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Procesar y enviar tus pedidos</li>
              <li>Contactarte sobre tu compra</li>
              <li>Mejorar nuestro sitio web y servicio</li>
              <li>Prevenir fraude y abuso</li>
              <li>Cumplir con leyes y regulaciones</li>
              <li>Enviar promociones (si lo autorizas)</li>
              <li>Responder a tus preguntas o quejas</li>
              <li>Proteger nuestros derechos legales</li>
            </ul>
          </section>

          <section id="seguridad">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Seguridad de Datos</h2>
            <p className="text-gray-700 mb-3">
              Un Poquito Variado implementa medidas de seguridad avanzadas:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li>Encriptación HTTPS en todas las conexiones</li>
              <li>Contraseñas hasheadas con bcrypt</li>
              <li>Autenticación por JWT (tokens)</li>
              <li>Firewall y protección DDoS</li>
              <li>Auditoría de acceso a datos</li>
              <li>Copias de seguridad regulares</li>
            </ul>
            <p className="text-gray-700">
              Sin embargo, no podemos garantizar seguridad absoluta. 
              Si sospechas una brecha de seguridad, contacta inmediatamente a soporte@miappventas.com
            </p>
          </section>

          <section id="derechos">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Tus Derechos</h2>
            <p className="text-gray-700 mb-3">
              Bajo la legislación de protección de datos, tienes derecho a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Acceso:</strong> Ver qué datos tenemos sobre ti</li>
              <li><strong>Rectificación:</strong> Corregir información incorrecta</li>
              <li><strong>Eliminación:</strong> Solicitar que borremos tus datos (dentro de límites legales)</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en formato estándar</li>
              <li><strong>Restricción:</strong> Limitar cómo usamos tus datos</li>
              <li><strong>Oposición:</strong> Objetar ciertos tipos de procesamiento</li>
            </ul>

            <p className="text-gray-700 mt-4">
              Para ejercer cualquiera de estos derechos, contacta a: 
              <a href="mailto:soporte@miappventas.com" className="text-blue-600 hover:underline ml-1">
                soporte@miappventas.com
              </a>
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p className="text-gray-700 mb-3">
              <strong>¿Qué son?</strong> Las cookies son pequeños archivos almacenados en tu navegador para recordar información.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Tipos de Cookies que Usamos:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li><strong>Esenciales:</strong> Para que el sitio funcione (carrito, login)</li>
              <li><strong>Preferencias:</strong> Para recordar tus configuraciones</li>
              <li><strong>Analytics:</strong> Para entender cómo usas el sitio (Google Analytics)</li>
            </ul>

            <p className="text-gray-700">
              <strong>Control:</strong> Puedes deshabilitar cookies en la configuración de tu navegador, 
              pero algunos servicios pueden no funcionar correctamente.
            </p>
          </section>

          <section id="terceros">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Servicios de Terceros</h2>
            <p className="text-gray-700 mb-3">
              Usamos servicios de terceros que pueden procesar tus datos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li><strong>Izipay:</strong> Para procesar pagos de forma segura con encriptación SSL de grado bancario (ver su política de privacidad)</li>
              <li><strong>Cloudinary:</strong> Para almacenar imágenes de productos</li>
              <li><strong>Google Analytics:</strong> Para analizar el tráfico del sitio</li>
            </ul>

            <p className="text-gray-700">
              Cada tercero tiene su propia política de privacidad. 
              No compartimos tu información innecesariamente y exigimos que protejan tus datos.
            </p>
          </section>

          <section id="contacto" className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contacto</h2>
            <p className="text-gray-700 mb-3">
              Si tienes preguntas sobre esta Política de Privacidad o tus datos:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> <a href="mailto:soporte@unpoquitovariado.com" className="text-blue-600 hover:underline">
                soporte@unpoquitovariado.com
              </a>
            </p>
            <p className="text-gray-700 mt-2">
              Responderemos en máximo 10 días hábiles.
            </p>
          </section>
        </div>

        <p className="text-sm text-gray-500 mt-8 pt-8 border-t">
          © {new Date().getFullYear()} Un Poquito Variado. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
