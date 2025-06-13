import React, { useState } from 'react';
import useAddressStore from '../stores/addressStore';
import useAuthStore from '../stores/authStore';

export default function AddressSelectionModal({ isOpen, onClose, onSelectAddress, selectedAddressId }) {
  const { addresses, loading, deleteAddress, setMainAddress, addAddress, updateAddress } = useAddressStore();
  const { user } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    namaPenerima: '',
    jalan: '',
    kelurahan: '',
    kecamatan: '',
    kotaKabupaten: '',
    provinsi: '',
    kodePos: '',
    phoneNumber: '',
    isUtama: false
  });

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

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      namaPenerima: address.namaPenerima || '',
      jalan: address.jalan || '',
      kelurahan: address.kelurahan || '',
      kecamatan: address.kecamatan || '',
      kotaKabupaten: address.kotaKabupaten || '',
      provinsi: address.provinsi || '',
      kodePos: address.kodePos || '',
      phoneNumber: address.phoneNumber || '',
      isUtama: address.isUtama || false
    });
    setShowAddForm(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const addressData = {
        ...formData,
        userId: user.userId
      };
      
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.addressId, addressData);
      } else {
        // Add new address
        await addAddress(addressData);
      }
      
      setShowAddForm(false);
      setEditingAddress(null);
      setFormData({
        namaPenerima: '',
        jalan: '',
        kelurahan: '',
        kecamatan: '',
        kotaKabupaten: '',
        provinsi: '',
        kodePos: '',
        phoneNumber: '',
        isUtama: false
      });
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Gagal menyimpan alamat: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {showAddForm ? (editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru') : 'Pilih Alamat Pengiriman'}
          </h2>
          <button
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setEditingAddress(null);
                setFormData({
                  namaPenerima: '',
                  jalan: '',
                  kelurahan: '',
                  kecamatan: '',
                  kotaKabupaten: '',
                  provinsi: '',
                  kodePos: '',
                  phoneNumber: '',
                  isUtama: false
                });
              } else {
                onClose();
              }
            }}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {showAddForm ? (
            /* Add Address Form */
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  name="namaPenerima"
                  value={formData.namaPenerima}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap penerima"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jalan/Alamat Detail *
                </label>
                <textarea
                  name="jalan"
                  value={formData.jalan}
                  onChange={handleInputChange}
                  placeholder="Nama jalan, nomor rumah, RT/RW, dll"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelurahan *
                  </label>
                  <input
                    type="text"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                    placeholder="Kelurahan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kecamatan *
                  </label>
                  <input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    placeholder="Kecamatan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota/Kabupaten *
                  </label>
                  <input
                    type="text"
                    name="kotaKabupaten"
                    value={formData.kotaKabupaten}
                    onChange={handleInputChange}
                    placeholder="Kota/Kabupaten"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi *
                  </label>
                  <input
                    type="text"
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleInputChange}
                    placeholder="Provinsi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos *
                </label>
                <input
                  type="text"
                  name="kodePos"
                  value={formData.kodePos}
                  onChange={handleInputChange}
                  placeholder="12345"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isUtama"
                  checked={formData.isUtama}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Jadikan sebagai alamat utama
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                    setFormData({
                      namaPenerima: '',
                      jalan: '',
                      kelurahan: '',
                      kecamatan: '',
                      kotaKabupaten: '',
                      provinsi: '',
                      kodePos: '',
                      phoneNumber: '',
                      isUtama: false
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : (editingAddress ? 'Update Alamat' : 'Simpan Alamat')}
                </button>
              </div>
            </form>
          ) : (
            /* Address List */
            <>
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
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Tambah Alamat Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.addressId}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddressId === address.addressId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-gray-800">{address.namaPenerima}</h3>
                            {address.isUtama && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Utama
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-1">{address.phoneNumber}</p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {address.jalan}, {address.kelurahan}, {address.kecamatan}, {address.kotaKabupaten}, {address.provinsi} {address.kodePos}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {selectedAddressId === address.addressId && (
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
                          {!address.isUtama && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainAddress(address.addressId);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Jadikan Utama
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(address.addressId);
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
            </>
          )}
        </div>

        {/* Footer */}
        {!showAddForm && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tambah Alamat Baru
            </button>
          </div>
        )}
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