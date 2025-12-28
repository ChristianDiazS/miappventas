import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó/rechazó
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Mostrar banner después de 1 segundo
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    // Activar scripts de terceros (Analytics, etc)
    activateThirdPartyScripts();
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      analytics: false,
      marketing: false,
      functional: true, // Siempre necesarias
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const handleCustomSettings = (settings) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    if (settings.analytics) {
      activateThirdPartyScripts();
    }
  };

  const activateThirdPartyScripts = () => {
    // Aquí iría la inicialización de Google Analytics u otros scripts
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {!expanded ? (
          // Banner colapsado
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-200 text-sm">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia. 
                Puedes personalizar tus preferencias o aceptar todas las cookies.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Aprende más sobre nuestras cookies
                </Link>
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={() => setExpanded(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Personalizar
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          // Banner expandido con opciones detalladas
          <CookieSettings
            onClose={() => setExpanded(false)}
            onSave={handleCustomSettings}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Componente para personalizar preferencias de cookies
 */
const CookieSettings = ({ onClose, onSave }) => {
  const [settings, setSettings] = useState({
    functional: true, // Siempre true
    analytics: false,
    marketing: false,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Configurar Cookies
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Cookies Funcionales - Siempre activas */}
      <CookieToggle
        name="functional"
        label="Cookies Funcionales"
        description="Necesarias para el funcionamiento del sitio (autenticación, preferencias, seguridad)"
        checked={true}
        disabled={true}
        icon="⚙️"
      />

      {/* Cookies de Analytics */}
      <CookieToggle
        name="analytics"
        label="Cookies de Análisis"
        description="Nos ayudan a entender cómo usas el sitio para mejorarlo (Google Analytics)"
        checked={settings.analytics}
        disabled={false}
        onChange={(checked) => setSettings({...settings, analytics: checked})}
        icon="📊"
      />

      {/* Cookies de Marketing */}
      <CookieToggle
        name="marketing"
        label="Cookies de Marketing"
        description="Permiten mostrarte anuncios relevantes en otros sitios (Google Ads, Facebook)"
        checked={settings.marketing}
        disabled={false}
        onChange={(checked) => setSettings({...settings, marketing: checked})}
        icon="📢"
      />

      {/* Información adicional */}
      <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 border border-gray-700">
        <p className="font-semibold text-gray-200 mb-2">Información sobre cookies:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Tu consentimiento se guarda por 12 meses</li>
          <li>Puedes cambiar tus preferencias en cualquier momento en la política de privacidad</li>
          <li>No usamos cookies para vender tus datos personales</li>
          <li>Cumplimos con GDPR, CCPA y legislación de e-Privacy</li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            setSettings({ functional: true, analytics: false, marketing: false });
            onSave({ functional: true, analytics: false, marketing: false });
          }}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          Solo Esenciales
        </button>
        <button
          onClick={() => onSave(settings)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
};

/**
 * Componente individual para cada toggle de cookie
 */
const CookieToggle = ({ name, label, description, checked, disabled, onChange, icon }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
    <span className="text-xl flex-shrink-0">{icon}</span>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <label className="font-medium text-white cursor-pointer">
          {label}
        </label>
        {disabled && (
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            Requerida
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.checked)}
      className="mt-1 flex-shrink-0 w-5 h-5 cursor-pointer"
    />
  </div>
);

export default CookieConsent;
