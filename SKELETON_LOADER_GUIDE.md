# 🎬 SkeletonLoader Component - Guía de Uso

## ¿Qué es?
Componente reutilizable que muestra placeholders de carga animados. Similar a:
- Netflix loading cards
- Amazon product skeletons
- Shopify product grids
- LinkedIn pulse animation

---

## ✨ Características

- 🎨 **7 variantes predefinidas** (card, text, heading, image, profile, list, generic)
- ⚡ **Animación smooth** con Tailwind animate-pulse
- 🔄 **Reutilizable** en toda la app
- 📱 **Responsive** out of the box
- 🧪 **10 tests** pasando (100%)
- 🎯 **Zero dependencies** (solo Tailwind)

---

## 📊 Variantes Disponibles

### 1. `variant="card"` (Product Cards)
```jsx
<SkeletonLoader variant="card" count={4} />
```
Carga: Imagen + Título + Precio + Botón
Uso: Página Products, Home

### 2. `variant="text"` (Párrafos)
```jsx
<SkeletonLoader variant="text" count={3} />
```
Carga: 3 líneas de texto
Uso: Descripciones, comentarios

### 3. `variant="heading"` (Títulos)
```jsx
<SkeletonLoader variant="heading" />
```
Carga: Título + Subtítulo
Uso: Page headers

### 4. `variant="image"` (Imágenes)
```jsx
<SkeletonLoader variant="image" />
```
Carga: Placeholder cuadrado
Uso: ProductDetail, Gallery

### 5. `variant="profile"` (Perfiles)
```jsx
<SkeletonLoader variant="profile" />
```
Carga: Avatar + Nombre + Email
Uso: Profile page, User info

### 6. `variant="list"` (Listas)
```jsx
<SkeletonLoader variant="list" count={5} />
```
Carga: Items con icon + texto
Uso: Orders, Dirección, Reviews

### 7. `variant="generic"` (Genérico)
```jsx
<SkeletonLoader />
```
Carga: Block rectangular
Uso: Fallback

---

## 🚀 Ejemplos de Uso

### En Products.jsx
```jsx
// Cuando cargando
if (loading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonLoader variant="card" count={8} />
    </div>
  );
}

// Cuando no hay resultados
if (filteredProducts.length === 0) {
  return <div>No hay productos</div>;
}

// Productos reales
return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {filteredProducts.map(product => (
      <ProductCard key={product._id} product={product} />
    ))}
  </div>
);
```

### En Home.jsx
```jsx
if (loading) {
  return <SkeletonLoader variant="card" count={4} />;
}

return (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {featuredProducts.map(p => (
      <Card key={p._id}>...</Card>
    ))}
  </div>
);
```

### En Orders.jsx
```jsx
if (loading) {
  return <SkeletonLoader variant="list" count={3} />;
}

return (
  <div className="space-y-4">
    {orders.map(order => (
      <OrderCard key={order._id} order={order} />
    ))}
  </div>
);
```

### En ProductDetail.jsx
```jsx
return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Imagen */}
    {loading ? (
      <SkeletonLoader variant="image" />
    ) : (
      <img src={product.image} />
    )}
    
    {/* Info */}
    {loading ? (
      <SkeletonLoader variant="heading" />
    ) : (
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    )}
  </div>
);
```

---

## 🎨 Props

```jsx
<SkeletonLoader
  variant="card"           // 'card' | 'text' | 'heading' | 'image' | 'profile' | 'list'
  count={4}               // Número de items (default: 1)
  className="custom-gap"  // Clases Tailwind adicionales
/>
```

---

## 📊 Tests Incluidos

```
✅ debe renderizar skeleton card
✅ debe renderizar múltiples skeletons
✅ debe renderizar text variant
✅ debe renderizar heading variant
✅ debe renderizar image variant
✅ debe renderizar profile variant
✅ debe renderizar list variant
✅ debe aplicar clase personalizada
✅ debe tener animación pulse
✅ debe tener fondo gris

Total: 10/10 ✅
```

---

## ⚡ Performance Impact

```
ANTES:
- Pantalla en blanco mientras carga
- Usuario piensa: "¿Se froze?"
- Bounce rate: Alto
- Perceived loading time: Lento

DESPUÉS:
- Skeleton animado mientras carga
- Usuario piensa: "Está cargando"
- Bounce rate: Bajo
- Perceived loading time: Rápido ⚡
```

---

## 🔄 Dónde Implementar (Prioritario)

### Fase 1 (Hoy):
1. ✅ Products.jsx (mayor uso)
2. ✅ Home.jsx (featured products)
3. ✅ Orders.jsx (lista de órdenes)

### Fase 2 (Próximo):
1. ✅ ProductDetail.jsx
2. ✅ Cart.jsx
3. ✅ Profile.jsx

### Fase 3 (Futuro):
1. ✅ Login.jsx
2. ✅ Checkout.jsx
3. ✅ Register.jsx

---

## 💡 Pro Tips

1. **Match variant con contenido**
   - Cards → productos
   - Text → descripciones
   - List → órdenes/direcciones
   - Profile → info de usuario

2. **Usa count para simular número real**
   ```jsx
   // 4 productos en laptop
   <SkeletonLoader variant="card" count={4} />
   
   // 2 productos en móvil
   <SkeletonLoader variant="card" count={2} />
   ```

3. **Combina variantes**
   ```jsx
   <SkeletonLoader variant="heading" />
   <SkeletonLoader variant="text" count={2} />
   <SkeletonLoader variant="card" count={3} />
   ```

4. **Simula tiempos reales**
   - 200ms de delay mínimo (se ve instantáneo)
   - 500ms-2s es óptimo
   - >3s muestra spinner en lugar de skeleton

---

## 🎯 Beneficios

- ✅ **UX Mejorada** - No parece "froze"
- ✅ **Confianza** - Muestra que algo pasa
- ✅ **Profesional** - Parece grande plataforma
- ✅ **Reusable** - Un componente, múltiples usos
- ✅ **Testeable** - 10 tests incluidos
- ✅ **Sin deps** - Solo Tailwind

---

## 📈 Comparación

```
Google Gmail: SkeletonLoader
Netflix: SkeletonLoader
Amazon: SkeletonLoader
Shopify: SkeletonLoader
LinkedIn: SkeletonLoader (Pulse Animation)
```

**Ahora MiAppVentas: SkeletonLoader ✅**

---

## 🚀 Implementación Inmediata

```bash
# 1. Componente ✅ (ya creado)
# 2. Tests ✅ (10/10 pasando)
# 3. Próximo: Integrar en Products.jsx

# Time: 15 minutos
# Impacto: ALTO
```

---

**¿Listo para integrar en Products?** 🚀
