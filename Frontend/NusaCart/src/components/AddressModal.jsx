import React, { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useAddressStore from '../stores/addressStore';

// --- KOMPONEN BARU: MODAL UNTUK ALAMAT ---
const AddressModal = ({ address, onClose, onSuccess }) => {
    const { user } = useAuthStore();
    const { addAddress, updateAddress, loading, error } = useAddressStore();
    const [formData, setFormData] = useState({
        namaPenerima: address?.namaPenerima || '',
        jalan: address?.jalan || '',
        kelurahan: address?.kelurahan || '',
        kecamatan: address?.kecamatan || '',
        kotaKabupaten: address?.kotaKabupaten || '',
        provinsi: address?.provinsi || '',
        kodePos: address?.kodePos || '',
        phoneNumber: address?.phoneNumber || '',
        isUtama: address?.isUtama || false,
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        try {
            if (address) {
                await updateAddress(address.addressId, { ...formData, userId: user.userId });
            } else {
                await addAddress({ ...formData, userId: user.userId });
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setLocalError(err?.message || 'Gagal menyimpan alamat');
        }
    };
    
    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">{address ? 'Ubah Alamat' : 'Tambah Alamat Baru'}</h2>
                {(error || localError) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error || localError}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="namaPenerima" value={formData.namaPenerima} onChange={handleChange} placeholder="Nama Penerima" className="w-full border rounded-lg p-3" required />
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Nomor Telepon" className="w-full border rounded-lg p-3" required />
                    <textarea name="jalan" value={formData.jalan} onChange={handleChange} placeholder="Jalan" className="w-full border rounded-lg p-3" rows="2" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="kelurahan" value={formData.kelurahan} onChange={handleChange} placeholder="Kelurahan/Desa" className="w-full border rounded-lg p-3" required />
                        <input type="text" name="kecamatan" value={formData.kecamatan} onChange={handleChange} placeholder="Kecamatan" className="w-full border rounded-lg p-3" required />
                        <input type="text" name="kotaKabupaten" value={formData.kotaKabupaten} onChange={handleChange} placeholder="Kota/Kabupaten" className="w-full border rounded-lg p-3" required />
                        <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} placeholder="Provinsi" className="w-full border rounded-lg p-3" required />
                    </div>
                    <input type="text" name="kodePos" value={formData.kodePos} onChange={handleChange} placeholder="Kode Pos" className="w-full border rounded-lg p-3" required />
                    <div className="flex items-center">
                        <input type="checkbox" id="isUtama" name="isUtama" checked={formData.isUtama} onChange={handleChange} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                        <label htmlFor="isUtama" className="ml-2 block text-sm text-gray-900">Jadikan alamat utama</label>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50" disabled={loading}>Batal</button>
                        <button type="submit" className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50" disabled={loading}>
                            {loading ? (address ? 'Menyimpan...' : 'Menambah...') : (address ? 'Simpan Alamat' : 'Tambah Alamat')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;