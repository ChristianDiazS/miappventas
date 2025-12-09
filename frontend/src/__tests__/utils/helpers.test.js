// Tests para funciones utilitarias comunes

describe('Price Formatting Utilities', () => {
  const formatPrice = (price) => {
    return `S/. ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  it('debe formatear precio en soles correctamente', () => {
    expect(formatPrice(1500)).toMatch(/S\/.*/);
  });

  it('debe formatear precio con decimales', () => {
    expect(formatPrice(1500.50)).toMatch(/S\/.*/);
  });

  it('debe formatear precio cero', () => {
    expect(formatPrice(0)).toMatch(/S\/.*/);
  });

  it('debe formatear precios grandes', () => {
    expect(formatPrice(1000000)).toMatch(/S\/.*/);
  });
});

describe('Date Formatting Utilities', () => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  it('debe formatear fecha correctamente', () => {
    const date = new Date('2025-12-07');
    const result = formatDate(date);
    expect(result).toBeDefined();
  });

  it('debe manejar strings de fecha', () => {
    const result = formatDate('2025-12-07');
    expect(result).toBeDefined();
  });

  it('debe ser diferente para fechas diferentes', () => {
    const date1 = formatDate('2025-12-07');
    const date2 = formatDate('2025-12-08');
    expect(date1).not.toBe(date2);
  });
});

describe('Email Validation Utilities', () => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('debe validar email correcto', () => {
    expect(validateEmail('usuario@ejemplo.com')).toBe(true);
  });

  it('debe rechazar email sin @', () => {
    expect(validateEmail('usuarioejemplo.com')).toBe(false);
  });

  it('debe rechazar email sin dominio', () => {
    expect(validateEmail('usuario@')).toBe(false);
  });

  it('debe rechazar email vacío', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('debe validar múltiples dominios', () => {
    expect(validateEmail('test@empresa.com.pe')).toBe(true);
  });
});

describe('Text Truncation Utilities', () => {
  const truncateText = (text, length) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  it('debe truncar texto largo', () => {
    const longText = 'Este es un texto muy largo que debe ser truncado';
    const result = truncateText(longText, 20);
    expect(result.length).toBeLessThanOrEqual(23);
  });

  it('no debe truncar texto corto', () => {
    const shortText = 'Corto';
    expect(truncateText(shortText, 20)).toBe('Corto');
  });

  it('debe agregar puntos suspensivos al truncar', () => {
    const text = 'Este es un texto larguísimo';
    const result = truncateText(text, 10);
    expect(result).toMatch(/\.\.\.$/);
  });

  it('debe respetar el límite exacto', () => {
    const text = 'Un texto de prueba';
    const result = truncateText(text, 5);
    expect(result).toBe('Un te...');
  });
});
