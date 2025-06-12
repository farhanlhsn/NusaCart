import React, { useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import useAddressStore from '../stores/addressStore';
import AddressModal from './AddressModal';

// --- KOMPONEN BARU: MANAJEMEN ALAMAT ---
const AddressList = () => {
    const { user } = useAuthStore();
    const {
        addresses,
        loading,
        error,
        isModalOpen,
        editingAddress,
        fetchAddresses,
        setMainAddress,
        deleteAddress,
        setEditingAddress,
        setModalOpen
    } = useAddressStore();

    useEffect(() => {
        if (user?.userId) {
            fetchAddresses();
        }
    }, [user?.userId, fetchAddresses]);

    const handleDelete = async (addressId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
            await deleteAddress(addressId);
        }
    };
    
    const handleSetPrimary = async (addressId) => {
        await setMainAddress(addressId);
    };

    const openAddModal = () => {
        setEditingAddress(null);
        setModalOpen(true);
    };

    const openEditModal = (address) => {
        setEditingAddress(address);
        setModalOpen(true);
    };

    return (
        <div className="shadow-lg rounded-2xl p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Daftar Alamat Saya</h2>
                <button
                    onClick={openAddModal}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                    + Tambah Alamat Baru
                </button>
            </div>

            {loading && <p>Memuat alamat...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {!loading && !error && addresses.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Anda belum memiliki alamat tersimpan.</p>
                </div>
            )}

            <div className="space-y-4">
                {addresses.map(address => (
                    <div key={address.addressId} className="border rounded-lg p-4 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-lg">{address.namaPenerima}</span>
                                {address.utama && (
                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Utama</span>
                                )}
                            </div>
                            <p className="text-gray-600">{address.phoneNumber}</p>
                            <p className="text-gray-600">
                                {`${address.jalan}, ${address.kelurahan}, ${address.kecamatan}, ${address.kotaKabupaten}, ${address.provinsi}, ${address.kodePos}`}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(address)} className="text-blue-500 hover:underline">Ubah</button>
                                <button onClick={() => handleDelete(address.addressId)} className="text-red-500 hover:underline">Hapus</button>
                            </div>
                             {!address.utama && (
                                <button
                                    onClick={() => handleSetPrimary(address.addressId)}
                                    className="text-sm mt-2 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100"
                                    disabled={loading}
                                >
                                    Jadikan Utama
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <AddressModal
                    address={editingAddress}
                    onClose={() => setModalOpen(false)}
                    onSuccess={fetchAddresses}
                />
            )}
        </div>
    );
};

export default AddressList;