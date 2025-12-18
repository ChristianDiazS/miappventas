// RESPALDO DE PRODUCTS.JSX - Guarda la estructura original de Joyería
// Fecha: 16 de diciembre de 2025
// Esta es una copia de seguridad antes de modificar la estructura de Joyería

// SECCIÓN JOYERÍA ORIGINAL (EXPANDIBLE):
/*
{/* Joyería - Expandible */}
<div>
  <button
    onClick={() => setExpandedCategory(expandedCategory === 'Joyería' ? null : 'Joyería')}
    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
      expandedCategory === 'Joyería' || selectedCategory?.includes('Joyería')
        ? 'bg-cyan-500 text-white font-semibold'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    <span>💍 Joyería</span>
    <span className="text-sm">{expandedCategory === 'Joyería' ? '▼' : '▶'}</span>
  </button>

  {/* Subcategorías de Joyería */}
  {expandedCategory === 'Joyería' && (
    <div className="ml-2 mt-2 space-y-2 border-l-2 border-cyan-300 pl-2">
      <button
        onClick={() => {
          setSelectedCategory('Collar');
          setShowDecoracionIntro(false);
        }}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
          selectedCategory === 'Collar'
            ? 'bg-cyan-400 text-white font-semibold'
            : 'bg-cyan-50 text-gray-700 hover:bg-cyan-100'
        }`}
      >
        📿 Collar
      </button>
      <button
        onClick={() => {
          setSelectedCategory('Dije');
          setShowDecoracionIntro(false);
        }}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
          selectedCategory === 'Dije'
            ? 'bg-cyan-400 text-white font-semibold'
            : 'bg-cyan-50 text-gray-700 hover:bg-cyan-100'
        }`}
      >
        ✨ Dije
      </button>
      <button
        onClick={() => {
          setSelectedCategory('Arete');
          setShowDecoracionIntro(false);
        }}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
          selectedCategory === 'Arete'
            ? 'bg-cyan-400 text-white font-semibold'
            : 'bg-cyan-50 text-gray-700 hover:bg-cyan-100'
        }`}
      >
        👂 Arete
      </button>
      <button
        onClick={() => {
          setSelectedCategory('Anillo');
          setShowDecoracionIntro(false);
        }}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
          selectedCategory === 'Anillo'
            ? 'bg-cyan-400 text-white font-semibold'
            : 'bg-cyan-50 text-gray-700 hover:bg-cyan-100'
        }`}
      >
        💍 Anillo
      </button>

      {/* Opción de Personalización */}
      <button
        onClick={() => navigate('/jewelry/builder')}
        className="w-full text-left px-4 py-2 rounded-lg transition-colors bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold hover:from-purple-500 hover:to-pink-500"
      >
        ✨ Personaliza tu Juego
      </button>
    </div>
  )}
</div>
*/

// ESTADO ORIGINAL:
/*
const [expandedCategory, setExpandedCategory] = useState(null);
const [showDecoracionIntro, setShowDecoracionIntro] = useState(false);
*/

// VARIABLES DE IMAGEN ORIGINALES:
/*
const anilloImages = [...]  // 51 imágenes
const decoracionBanoImages = [...] // 11 imágenes
*/
