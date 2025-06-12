import React, { useState, useRef } from 'react';
import api from '../services/api';

const ImageUpload = ({ 
  currentImageUrl, 
  onImageUpdate, 
  imageType = 'profile', // 'profile', 'product', 'store'
  className = '',
  size = 'medium', // 'small', 'medium', 'large'
  showLabel = true,
  label = 'Ganti Foto'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    small: { width: 'w-8 h-8', text: 'text-xs' },
    medium: { width: 'w-12 h-12', text: 'text-sm' },
    large: { width: 'w-24 h-24', text: 'text-base' }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const handleImageClick = () => {
    if (!isLoading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validasi ukuran file (maksimal 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file tidak boleh lebih dari 10MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Tambahkan oldImageUrl jika ada
    if (currentImageUrl) {
      formData.append('oldImageUrl', currentImageUrl);
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint;
      switch (imageType) {
        case 'profile':
          endpoint = '/api/images/upload/profile';
          break;
        case 'product':
          endpoint = '/api/images/upload/product';
          break;
        case 'store':
          endpoint = '/api/images/upload/store';
          break;
        default:
          endpoint = `/api/images/upload?type=${imageType}`;
      }

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 && response.data.status === 'success') {
        const newImageUrl = response.data.imageUrl;
        setSuccess('Foto berhasil diperbarui dan dikompres');
        
        // Callback untuk update parent component
        if (onImageUpdate) {
          onImageUpdate(newImageUrl, response.data);
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Gagal mengunggah foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengunggah foto';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isRowReverse = className.includes('flex-row-reverse');
  const hasGap = className.includes('gap-');
  const containerClass = isRowReverse ? 'flex flex-row-reverse items-center' : 'flex flex-col items-center';
  const labelMargin = isRowReverse && !hasGap ? 'mr-4' : !isRowReverse && !hasGap ? 'mb-2' : '';
  const cleanClassName = className.replace('flex-row-reverse', '').trim();

  return (
    <div className={`${containerClass} ${cleanClassName}`}>
      {showLabel && (
        <span className={`text-white ${labelMargin} ${currentSize.text}`}>{label}</span>
      )}
      
      <div 
        className={`${currentSize.width} bg-white rounded-full cursor-pointer flex items-center justify-center overflow-hidden border-2 border-gray-300 hover:border-gray-400 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} relative`}
        onClick={handleImageClick}
      >
        {currentImageUrl ? (
          <img 
            src={`http://localhost:6060${currentImageUrl}`} 
            alt="Current" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-gray-400 text-xl">+</span>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
        disabled={isLoading}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-red-500 text-xs text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-2 text-green-500 text-xs text-center max-w-xs">
          {success}
        </div>
      )}

      {/* Loading indicator text */}
      {isLoading && (
        <div className="mt-2 text-blue-500 text-xs text-center">
          Mengupload dan mengompres...
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 