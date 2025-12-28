import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validación básica
      if (!formData.name || !formData.email || !formData.message) {
        alert('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Validar email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Por favor ingresa un email válido');
        setLoading(false);
        return;
      }

      // Enviar email (endpoint a implementar)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('¡Mensaje enviado! Nos contactaremos pronto');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        alert('Error al enviar el mensaje. Intenta más tarde');
      }
    } catch (error) {
      // Si falla, mostrar email de contacto alternativo
      alert(`No se pudo enviar por el formulario.\n\nContacta directamente a:\nsoporte@unpoquitovariado.com`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contacto
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aquí para ayudarte. Cuéntanos cómo podemos asistirte.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Email */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">
              Envíanos un email y responderemos en 24 horas
            </p>
            <a 
              href="mailto:soporte@unpoquitovariado.com"
              className="text-blue-600 hover:underline font-semibold mt-2 inline-block"
            >
              soporte@unpoquitovariado.com
            </a>
          </div>

          {/* Phone */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Teléfono</h3>
            <p className="text-gray-600">
              Disponible de lunes a viernes, 9am - 5pm
            </p>
            <a 
              href="tel:+51999999999"
              className="text-green-600 hover:underline font-semibold mt-2 inline-block"
            >
              +51 9 9999-9999
            </a>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ubicación</h3>
            <p className="text-gray-600">
              Lima, Perú
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Disponible online 24/7
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos tu Mensaje</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="tu@email.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (Opcional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="+51 9 XXXX-XXXX"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Asunto (Opcional)
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Selecciona un asunto</option>
                <option value="compra">Pregunta sobre una compra</option>
                <option value="producto">Información de producto</option>
                <option value="envio">Problema con envío</option>
                <option value="devolucion">Devolución/Cambio</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Cuéntanos cómo podemos ayudarte..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>

            <p className="text-xs text-gray-500">
              * Campos requeridos
            </p>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: '¿Cuánto tarda el envío?',
                a: 'Los pedidos generalmente se envían en 2-3 días hábiles después de la compra.'
              },
              {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos tarjetas de crédito/débito a través de Izipay (Visa, Mastercard, American Express).'
              },
              {
                q: '¿Puedo devolver un producto?',
                a: 'Sí, tienes 30 días para solicitar devolución. Ver nuestra Política de Devoluciones.'
              },
              {
                q: '¿Hacen envíos internacionales?',
                a: 'Actualmente solo envíamos dentro de Perú. Consulta sobre excepciones.'
              },
              {
                q: '¿Los productos tienen garantía?',
                a: 'Todos nuestros productos tienen garantía de calidad. Contacta si tienes problemas.'
              },
              {
                q: '¿Cómo rastreo mi pedido?',
                a: 'Recibirás un email con el número de seguimiento cuando se envíe tu producto.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
