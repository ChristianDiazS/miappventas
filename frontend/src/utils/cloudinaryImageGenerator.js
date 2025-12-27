/**
 * Generador de imágenes de Cloudinary para componentes de combos
 * Genera imágenes de componentes individuales cuando se agrega un combo
 */

const cloudName = 'dy73lxudf';
const baseTransformations = 'c_limit,f_auto,q_auto,w_400';

/**
 * Genera una imagen recortada usando transformaciones Cloudinary
 */
function generateCroppedImageUrl(publicId, x = 0, y = 0, width = 100, height = 100) {
  const cropTransform = `x_${x},y_${y},w_${width},h_${height},c_crop`;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${cropTransform},${baseTransformations}/${publicId}`;
}

/**
 * Genera una URL de imagen para un componente individual basado en su categoría
 * Esto se usa cuando el combo NO tiene una imagen de Cloudinary válida
 */
function generateComponentImageUrl(componentType, componentIndex = 1) {
  const categoryMap = {
    collar: 'joyeria/collares',
    dije: 'joyeria/dijes',
    arete: 'joyeria/aretes',
    anillo: 'joyeria/anillos'
  };

  const folder = categoryMap[componentType] || categoryMap.collar;
  // Intenta usar la primera imagen disponible del componente
  return `https://res.cloudinary.com/${cloudName}/image/upload/${baseTransformations}/${folder}/img-${componentType}1.jpeg`;
}

/**
 * Genera imágenes recortadas para cada componente de un combo
 * Usa las imágenes editadas que corresponden a cada pieza
 */
export function generateComponentImagesFromCombo(product, componentType) {
  console.log('🔍 generateComponentImagesFromCombo llamado:', {
    productTitle: product.title,
    componentType,
    imageSummary: product.image?.substring(0, 80) + '...'
  });

  if (!product.image) {
    console.warn('⚠️  Producto sin imagen');
    return null;
  }

  try {
    // Extraer el nombre base de la imagen (ej: "img-collardijearete9")
    const uploadIndex = product.image.indexOf('/upload/');
    if (uploadIndex === -1) {
      console.warn('No es una URL de Cloudinary válida');
      return product.image;
    }

    let rest = product.image.substring(uploadIndex + 8);
    
    // Saltar la versión (v1766763796/) si existe
    const versionMatch = rest.match(/^v\d+\//);
    if (versionMatch) {
      rest = rest.substring(versionMatch[0].length);
    }
    
    // Extraer el nombre del archivo sin extensión
    const fullPath = rest.replace(/\.\w+$/, ''); // Ej: "miappventas/collar-dije-arete/img-collardijearete9"
    
    // Obtener solo el nombre del archivo (última parte)
    const fileNameWithPath = fullPath.split('/');
    const fileName = fileNameWithPath[fileNameWithPath.length - 1]; // Ej: "img-collardijearete9"
    
    console.log(`📌 Nombre base extraído: ${fileName}`);

    // Generar URL según el componente
    // Para collar: usa la imagen base (ya enfocada en collar)
    // Para dije: usa img-collardijearete9-dije
    // Para arete: usa img-collardijearete9-arete
    let componentFileName = fileName;
    let transformations = baseTransformations;
    
    if (componentType === 'dije') {
      componentFileName = `${fileName}-dije`;
    } else if (componentType === 'arete') {
      componentFileName = `${fileName}-arete`;
      // Recorte desplazado hacia arriba y hacia la derecha - centrado
      transformations = 'x_75,y_-100,w_400,h_400,c_crop,f_auto,q_auto';
    }
    // Para 'collar' y 'anillo', usamos el nombre base sin sufijo

    // Reconstruir la ruta completa
    const componentPath = `miappventas/collar-dije-arete/${componentFileName}`;
    
    // Generar URL de Cloudinary
    const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${componentPath}.jpeg`;
    
    console.log(`✅ URL para ${componentType}:`, transformedUrl);
    return transformedUrl;
    
  } catch (e) {
    console.error('❌ Error generando URL de componente:', e);
    return product.image;
  }
}

/**
 * Genera todas las imágenes de componentes de un combo
 */
export function generateAllComponentImagesFromCombo(product) {
  if (!product.comboItems) {
    return {
      collar: null,
      dije: null,
      arete: null,
      anillo: null
    };
  }

  return {
    collar: product.comboItems.collar ? generateComponentImagesFromCombo(product, 'collar') : null,
    dije: product.comboItems.dije ? generateComponentImagesFromCombo(product, 'dije') : null,
    arete: product.comboItems.arete ? generateComponentImagesFromCombo(product, 'arete') : null,
    anillo: product.comboItems.anillo ? generateComponentImagesFromCombo(product, 'anillo') : null
  };
}

export function generateCloudinaryImageForComponent(product, componentType) {
  if (product.image && product.image.includes('cloudinary')) {
    return product.image;
  }
  return product.image || '';
}

/**
 * Genera imágenes para todos los componentes de un combo
 */
export function generateComboComponentImages(product) {
  if (!product.comboItems) {
    return null;
  }

  return {
    collar: product.comboItems.collar ? generateCloudinaryImageForComponent(product, 'collar') : null,
    dije: product.comboItems.dije ? generateCloudinaryImageForComponent(product, 'dije') : null,
    arete: product.comboItems.arete ? generateCloudinaryImageForComponent(product, 'arete') : null,
    anillo: product.comboItems.anillo ? generateCloudinaryImageForComponent(product, 'anillo') : null
  };
}
