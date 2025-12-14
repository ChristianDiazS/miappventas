import { useState, useRef } from 'react';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';

/**
 * ImageUploader Component
 * Componente para subir imágenes a Cloudinary
 * 
 * Props:
 *  - onImageUpload: (image: {url, publicId, ...}) => void
 *  - multiple: boolean (default: false)
 *  - maxSize: number in MB (default: 10)
 */
export function ImageUploader({ onImageUpload, multiple = false, maxSize = 10 }) {
  const { upload, uploading, error, progress } = useCloudinaryUpload();
  const [preview, setPreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      // Validar tamaño
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Archivo demasiado grande. Máximo ${maxSize}MB`);
        continue;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes');
        continue;
      }

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Subir imagen
      const uploadedImage = await upload(file);
      
      if (uploadedImage) {
        setUploadedImages(prev => [...prev, uploadedImage]);
        onImageUpload(uploadedImage);
      }

      if (!multiple) break;
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Subiendo... {progress}%</p>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-8 w-8 text-gray-400 mb-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-3.172-3.172a2 2 0 00-2.828 0L28 12m0 0L16 24m12-12v12m-8 4a2 2 0 11-4 0 2 2 0 014 0z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-600 font-medium">Sube una imagen</p>
            <p className="text-xs text-gray-500">PNG, JPG hasta {maxSize}MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && !uploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Vista previa:</p>
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {uploadedImages.length} imagen{uploadedImages.length !== 1 ? 's' : ''} subida{uploadedImages.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
