import { useState } from 'react';
import api from '../services/api';

const SellerRegistrationModal = ({ show, onClose }) => {
    const [formData, setFormData] = useState({
        namaToko: '',
        alamatToko: '',
        noTelpToko: '',
        emailToko: '',
        descriptionToko: '',
        profilePictureTokoURL: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/seller/register', formData);
            
            if (response.status === 201) {
                alert('Berhasil mendaftar sebagai seller! Anda sekarang dapat mengelola toko.');
                
                const updatedUser = {
                    ...user,
                    role: [...(user.role || []), 'SELLER']
                };
                login({ user: updatedUser });
                
                onClose();
                window.location.reload();
            }
        } catch (err) {
            console.error('Seller registration error:', err);
            setError(err.response?.data?.message || 'Gagal mendaftar sebagai seller');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Daftar Sebagai Seller</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="namaToko" value={formData.namaToko} onChange={handleChange} placeholder="Nama Toko *" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200" required />
                    <textarea name="alamatToko" value={formData.alamatToko} onChange={handleChange} placeholder="Alamat Toko *" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200" rows={2} required />
                    <input type="tel" name="noTelpToko" value={formData.noTelpToko} onChange={handleChange} placeholder="Nomor Telepon Toko *" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200" required />
                    <input type="email" name="emailToko" value={formData.emailToko} onChange={handleChange} placeholder="Email Toko *" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200" required />
                    <textarea name="descriptionToko" value={formData.descriptionToko} onChange={handleChange} placeholder="Deskripsi Toko *" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200" rows={3} required />

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50" disabled={loading}>Batal</button>
                        <button type="submit" className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50" disabled={loading}>
                            {loading ? 'Mendaftar...' : 'Daftar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellerRegistrationModal;