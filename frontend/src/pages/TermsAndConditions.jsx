import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Términos y Condiciones
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
            <li><a href="#uso" className="text-blue-600 hover:underline">1. Uso del Sitio</a></li>
            <li><a href="#productos" className="text-blue-600 hover:underline">2. Productos y Precios</a></li>
            <li><a href="#pedidos" className="text-blue-600 hover:underline">3. Realización de Pedidos</a></li>
            <li><a href="#pago" className="text-blue-600 hover:underline">4. Métodos de Pago</a></li>
            <li><a href="#devoluciones" className="text-blue-600 hover:underline">5. Devoluciones y Cambios</a></li>
            <li><a href="#responsabilidad" className="text-blue-600 hover:underline">6. Limitación de Responsabilidad</a></li>
            <li><a href="#propiedad" className="text-blue-600 hover:underline">7. Propiedad Intelectual</a></li>
            <li><a href="#cambios" className="text-blue-600 hover:underline">8. Cambios en los Términos</a></li>
          </ul>
        </nav>

        <div className="space-y-6">
          <section id="uso">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Uso del Sitio</h2>
            <p className="text-gray-700 mb-3">
              Al acceder y utilizar Un Poquito Variado, aceptas estos Términos y Condiciones en su totalidad. 
              Si no estás de acuerdo con alguna parte, por favor no utilices nuestro sitio web.
            </p>
            <p className="text-gray-700">
              Un Poquito Variado es una plataforma de venta de artículos de joyería, peluches y decoración. 
              Te comprometes a utilizar el sitio únicamente para propósitos legales y autorizados.
            </p>
          </section>

          <section id="productos">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Productos y Precios</h2>
            <p className="text-gray-700 mb-3">
              <strong>Disponibilidad:</strong> Todos los productos están sujetos a disponibilidad. 
              Aunque intentamos mantener información precisa, no garantizamos que el inventario sea exacto en tiempo real.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Precios:</strong> Los precios están expresados en Soles Peruanos (S/.) e incluyen IGV. 
              Nos reservamos el derecho de cambiar los precios sin previo aviso. El precio que aparece al momento 
              de agregar un producto al carrito es el precio final a pagar.
            </p>
            <p className="text-gray-700">
              <strong>Descripción de Productos:</strong> Intentamos proporcionar descripciones precisas de nuestros productos. 
              Sin embargo, Un Poquito Variado no garantiza la exactitud de fotos, colores o descripciones.
            </p>
          </section>

          <section id="pedidos">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Realización de Pedidos</h2>
            <p className="text-gray-700 mb-3">
              <strong>Confirmación:</strong> Al realizar un pedido, recibirás una confirmación por correo electrónico 
              con los detalles de tu compra.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Información Correcta:</strong> Te comprometes a proporcionar información verdadera, 
              exacta y actualizada en tu perfil y en cada pedido.
            </p>
            <p className="text-gray-700">
              <strong>Aceptación de Pedidos:</strong> Un Poquito Variado se reserva el derecho de rechazar o cancelar 
              cualquier pedido por razones legales, de seguridad o incumplimiento de estos términos.
            </p>
          </section>

          <section id="pago">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Métodos de Pago</h2>
            <p className="text-gray-700 mb-3">
              <strong>Procesamiento:</strong> Los pagos se procesan a través de Izipay, una plataforma de pago segura certificada internacionalmente. 
              Tu información de pago es procesada directamente por Izipay y no es almacenada en nuestros servidores. Izipay utiliza encriptación SSL de grado bancario para proteger tus datos.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Responsabilidad:</strong> Un Poquito Variado no es responsable de problemas en la plataforma de pago. 
              Para disputas de pago, contacta directamente a Izipay o a tu banco.
            </p>
            <p className="text-gray-700">
              <strong>Moneda:</strong> Todos los precios están en Soles Peruanos (S/.). Si utilizas una tarjeta 
              internacional, tu banco puede aplicar cargos de conversión de moneda adicionales.
            </p>
          </section>

          <section id="devoluciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Devoluciones y Cambios</h2>
            <p className="text-gray-700 mb-3">
              <strong>Plazo de Devolución:</strong> Puedes solicitar una devolución o cambio dentro de 30 días 
              después de haber recibido tu producto.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Condiciones:</strong> El producto debe estar en condición original, sin usar, 
              con todas las etiquetas intactas y en su empaque original.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Proceso:</strong> Para solicitar una devolución, contacta a nuestro equipo de soporte 
              con fotos del producto y el recibo de compra.
            </p>
            <p className="text-gray-700">
              <strong>Reembolso:</strong> Los reembolsos serán procesados dentro de 7-10 días después de recibir 
              y verificar el producto devuelto.
            </p>
          </section>

          <section id="responsabilidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 mb-3">
              Un Poquito Variado no será responsable por:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li>Daños durante el envío (contactar al transportista)</li>
              <li>Pérdida de productos en tránsito</li>
              <li>Interrupciones del servicio por causas ajenas a nosotros</li>
              <li>Daños indirectos o consecuentes</li>
              <li>Errores de usuario en la plataforma</li>
            </ul>
            <p className="text-gray-700">
              <strong>Responsabilidad Máxima:</strong> Nuestra responsabilidad máxima es el monto pagado por el producto.
            </p>
          </section>

          <section id="propiedad">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Propiedad Intelectual</h2>
            <p className="text-gray-700 mb-3">
              Todos los contenidos del sitio (textos, imágenes, logos, código) son propiedad de Un Poquito Variado 
              o están autorizados para su uso.
            </p>
            <p className="text-gray-700">
              No puedes reproducir, modificar, distribuir o usar nuestro contenido sin autorización expresa. 
              Esto incluye fotografías de productos.
            </p>
          </section>

          <section id="cambios">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Cambios en los Términos</h2>
            <p className="text-gray-700">
              Un Poquito Variado se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Los cambios entrarán en vigencia inmediatamente después de su publicación. 
              Tu uso continuado del sitio implica aceptación de los nuevos términos.
            </p>
          </section>

          <section className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contacto</h2>
            <p className="text-gray-700 mb-2">
              Si tienes preguntas sobre estos Términos y Condiciones, contacta:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> <a href="mailto:soporte@unpoquitovariado.com" className="text-blue-600 hover:underline">
                soporte@unpoquitovariado.com
              </a>
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
