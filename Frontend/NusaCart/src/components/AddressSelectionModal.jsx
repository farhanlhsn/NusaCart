import React, { useState } from 'react';
import useAddressStore from '../stores/addressStore';

export default function AddressSelectionModal({ isOpen, onClose, onSelectAddress, selectedAddressId }) {
  const { addresses, loading, deleteAddress, setMainAddress } = useAddressStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  if (!isOpen) return null;

  const handleSelectAddress = (address) => {
    onSelectAddress(address);
    onClose();
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleSetMainAddress = async (addressId) => {
    try {
      await setMainAddress(addressId);
    } catch (error) {
      console.error('Failed to set main address:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Pilih Alamat Pengiriman</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum Ada Alamat</h3>
              <p className="text-gray-600 mb-4">Tambahkan alamat pengiriman untuk melanjutkan checkout</p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Tambah Alamat Baru
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-gray-800">{address.label}</h3>
                        {address.isPrimary && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Utama
                          </span>
                        )}
                      </div>
                      
                      <p className="font-medium text-gray-700 mb-1">{address.recipientName}</p>
                      <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{address.fullAddress}</p>
                      
                      {address.notes && (
                        <p className="text-gray-500 text-xs mt-2 italic">Catatan: {address.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {selectedAddressId === address.id && (
                        <div className="text-blue-500">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      {!address.isPrimary && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMainAddress(address.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Jadikan Utama
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit - you can add this functionality
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(address.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Tambah Alamat Baru
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hapus Alamat</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteAddress(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 