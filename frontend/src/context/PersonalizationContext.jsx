import { createContext, useContext, useState } from 'react';

const PersonalizationContext = createContext();

export function PersonalizationProvider({ children }) {
  const [selectedItems, setSelectedItems] = useState({
    collar: null,
    dije: null,
    arete: null,
    anillo: null
  });

  const [componentImages, setComponentImages] = useState({
    collar: null,
    dije: null,
    arete: null,
    anillo: null
  });

  const [totalDiscount] = useState(0.18); // 18% discount

  const addToPersonalization = (category, product) => {
    setSelectedItems(prev => ({
      ...prev,
      [category.toLowerCase()]: product
    }));

    // Si hay una imagen específica para este componente, guardarla
    if (product.componentImage) {
      setComponentImages(prev => ({
        ...prev,
        [category.toLowerCase()]: product.componentImage
      }));
    }
  };

  const removeFromPersonalization = (category) => {
    setSelectedItems(prev => ({
      ...prev,
      [category.toLowerCase()]: null
    }));
    setComponentImages(prev => ({
      ...prev,
      [category.toLowerCase()]: null
    }));
  };

  const clearPersonalization = () => {
    setSelectedItems({
      collar: null,
      dije: null,
      arete: null,
      anillo: null
    });
    setComponentImages({
      collar: null,
      dije: null,
      arete: null,
      anillo: null
    });
  };

  const isComplete = () => {
    return selectedItems.collar && selectedItems.dije && selectedItems.arete && selectedItems.anillo;
  };

  const getTotalPrice = () => {
    const items = [selectedItems.collar, selectedItems.dije, selectedItems.arete, selectedItems.anillo].filter(Boolean);
    const basePrice = items.reduce((sum, item) => sum + item.price, 0);
    const discountAmount = basePrice * totalDiscount;
    return basePrice - discountAmount;
  };

  const getBasePrice = () => {
    const items = [selectedItems.collar, selectedItems.dije, selectedItems.arete, selectedItems.anillo].filter(Boolean);
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const value = {
    selectedItems,
    componentImages,
    addToPersonalization,
    removeFromPersonalization,
    clearPersonalization,
    isComplete,
    getTotalPrice,
    getBasePrice,
    totalDiscount
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
}
