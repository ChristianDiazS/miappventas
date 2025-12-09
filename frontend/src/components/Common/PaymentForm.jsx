import React, { useState } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Toast } from './Toast';

export default function PaymentForm({ orderId, amount, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCVC, setShowCVC] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });
  const [errors, setErrors] = useState({});

  // Validar número de tarjeta (Algoritmo de Luhn)
  const validateCardNumber = (number) => {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  // Validar fecha de expiración
  const validateExpiry = (month, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const expYear = parseInt(`20${year}`);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  };

  // Validar CVC
  const validateCVC = (cvc) => {
    return /^\d{3,4}$/.test(cvc);
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  };

  // Formatear fecha de expiración
  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    if (name === 'expiry') {
      const [month, year] = formattedValue.split('/');
      setFormData({
        ...formData,
        expiryMonth: month || '',
        expiryYear: year || ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    }

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Número de tarjeta requerido';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Nombre del titular requerido';
    } else if (formData.cardHolder.trim().length < 3) {
      newErrors.cardHolder = 'Nombre debe tener al menos 3 caracteres';
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Fecha de expiración requerida';
    } else if (!validateExpiry(formData.expiryMonth, formData.expiryYear)) {
      newErrors.expiry = 'Tarjeta expirada o fecha inválida';
    }

    if (!formData.cvc) {
      newErrors.cvc = 'CVC requerido';
    } else if (!validateCVC(formData.cvc)) {
      newErrors.cvc = 'CVC debe ser 3 o 4 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId) {
      setToast({
        type: 'error',
        message: 'Error: ID de orden no disponible. Por favor intenta de nuevo.'
      });
      onError(new Error('Order ID is missing'));
      return;
    }

    if (!validate()) {
      setToast({
        type: 'error',
        message: 'Por favor corrige los errores en el formulario'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          cardData: {
            number: formData.cardNumber.replace(/\s/g, ''),
            holder: formData.cardHolder,
            expiry: `${formData.expiryMonth}/${formData.expiryYear}`,
            cvc: formData.cvc
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el pago');
      }

      setToast({
        type: 'success',
        message: '¡Pago procesado exitosamente!'
      });

      // Limpiar formulario
      setFormData({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: ''
      });

      // Llamar callback de éxito
      if (onSuccess) {
        setTimeout(() => onSuccess(data), 1500);
      }
    } catch (error) {
      console.error('Error en pago:', error);
      setToast({
        type: 'error',
        message: error.message || 'Error al procesar el pago'
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const expiry = `${formData.expiryMonth}${formData.expiryYear ? '/' + formData.expiryYear : ''}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6">Información de Pago</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Monto a pagar */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Monto a pagar</p>
          <p className="text-3xl font-bold text-gray-900">
            S/. {amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Tarjeta
          </label>
          <input
            type="text"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={handleChange}
            maxLength="19"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Nombre del titular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Titular
          </label>
          <input
            type="text"
            name="cardHolder"
            placeholder="Juan Pérez"
            value={formData.cardHolder}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.cardHolder ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.cardHolder && (
            <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
          )}
        </div>

        {/* Fecha de expiración y CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vencimiento (MM/YY)
            </label>
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              value={expiry}
              onChange={handleChange}
              maxLength="5"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.expiry ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.expiry && (
              <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <div className="relative">
              <input
                type={showCVC ? 'text' : 'password'}
                name="cvc"
                placeholder="123"
                value={formData.cvc}
                onChange={handleChange}
                maxLength="4"
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCVC(!showCVC)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showCVC ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 9.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                    <path d="M7 8c.6-.4 1.3-.6 2-.6.7 0 1.4.2 2 .6M13 8c.6-.4 1.3-.6 2-.6.7 0 1.4.2 2 .6M19 8c.6-.4 1.3-.6 2-.6.7 0 1.4.2 2 .6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
            {errors.cvc && (
              <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>
            )}
          </div>
        </div>

        {/* Aviso de seguridad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 7a1 1 0 000 2h6a1 1 0 000-2H8zm0 4a1 1 0 000 2h3a1 1 0 000-2H8z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800">
            Tu información de pago es segura. Los datos se encriptan y procesan de forma segura.
          </p>
        </div>

        {/* Botón de envío */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-lg font-semibold"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" color="white" />
              Procesando pago...
            </span>
          ) : (
            `Pagar S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </Button>
      </form>

      {/* Toast notificación */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
