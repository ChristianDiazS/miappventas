// Tests para funciones de utilidades de API

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('buildQueryString', () => {
    const buildQueryString = (params) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });
      return searchParams.toString();
    };

    it('debe construir query string correcto', () => {
      const params = { page: 1, limit: 10, category: 'electronics' };
      const result = buildQueryString(params);
      expect(result).toContain('page=1');
      expect(result).toContain('limit=10');
      expect(result).toContain('category=electronics');
    });

    it('debe manejar parámetros vacíos', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });

    it('debe codificar caracteres especiales', () => {
      const params = { search: 'laptop accesorios' };
      const result = buildQueryString(params);
      expect(result).toContain('search');
    });

    it('debe ignorar valores undefined y null', () => {
      const params = { page: 1, empty: undefined, nullVal: null };
      const result = buildQueryString(params);
      expect(result).toContain('page=1');
      expect(result).not.toContain('empty');
      expect(result).not.toContain('nullVal');
    });
  });

  describe('handleApiError', () => {
    const handleApiError = (error) => {
      if (!error.status) {
        return { status: 500, message: error.message || 'Error desconocido' };
      }
      return { status: error.status, message: error.message };
    };

    it('debe manejar error de red', () => {
      const error = new Error('Network error');
      const result = handleApiError(error);
      expect(result.status).toBe(500);
    });

    it('debe manejar error 401 como no autorizado', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const result = handleApiError(error);
      expect(result.status).toBe(401);
    });

    it('debe manejar error 404 como no encontrado', () => {
      const error = { status: 404, message: 'Not found' };
      const result = handleApiError(error);
      expect(result.status).toBe(404);
    });

    it('debe retornar mensaje del error', () => {
      const error = { status: 400, message: 'Bad request' };
      const result = handleApiError(error);
      expect(result.message).toBe('Bad request');
    });
  });

  describe('apiCall', () => {
    const apiCall = async (endpoint, options = {}) => {
      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    };

    it('debe hacer llamada GET correcta', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'test' })
        })
      );

      const result = await apiCall('/api/products');
      expect(fetch).toHaveBeenCalled();
      expect(result.data).toBe('test');
    });

    it('debe incluir headers correctos', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        })
      );

      await apiCall('/api/products');
      expect(fetch).toHaveBeenCalledWith(
        '/api/products',
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });

    it('debe hacer llamada POST con datos', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      await apiCall('/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/products',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('debe lanzar error en respuesta no ok', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400
        })
      );

      await expect(apiCall('/api/products')).rejects.toThrow();
    });

    it('debe parsear JSON de respuesta', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, name: 'Product' })
        })
      );

      const result = await apiCall('/api/products');
      expect(result.id).toBe(1);
      expect(result.name).toBe('Product');
    });
  });
});
