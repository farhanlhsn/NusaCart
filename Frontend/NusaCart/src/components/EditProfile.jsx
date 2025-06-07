import React, { useState, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import api from '../services/api';
import ImageUpload from './ImageUpload';

const EditProfile = ({ onClose }) => {
  const { user, login } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpdate = (newImageUrl, responseData) => {
    // Update user state dengan foto profil baru
    const currentState = useAuthStore.getState();
    login({
      ...currentState,
      user: {
        ...currentState.user,
        profilePicture: newImageUrl
      }
    });
    setSuccess('Foto profil berhasil diperbarui dan dikompres');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Password baru dan konfirmasi password tidak cocok');
        return;
      }
      if (!formData.currentPassword) {
        setError('Password saat ini diperlukan untuk mengubah password');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const response = await api.put('/api/user/update_profile', updateData);
      
      if (response.status === 200) {
        login({
          ...useAuthStore.getState(),
          user: {
            ...user,
            name: updateData.name,
            email: updateData.email,
            phoneNumber: updateData.phoneNumber
          }
        });
        setSuccess('Profil berhasil diperbarui');
        setTimeout(() => {
          setSuccess('');
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Data tidak valid');
      } else if (error.response?.status === 409) {
        setError('Email sudah digunakan oleh pengguna lain');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Terjadi kesalahan saat memperbarui profil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#E64646] rounded-3xl shadow-xl p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-2xl font-bold">Edit Profil</h2>
        <ImageUpload
          currentImageUrl={user?.profilePicture}
          onImageUpdate={handleImageUpdate}
          imageType="profile"
          size="medium"
          label="Ganti Foto Profil"
          className="flex-row-reverse gap-2"
        />
      </div>

      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
      <div className="mb-4">
          <label className="block text-white text-sm mb-2">Nama</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none"
            placeholder="Rimel"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none"
            placeholder="rimel1111@gmail.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Nomor Telepon</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none"
            placeholder="08123456789"
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Password Changes</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none mb-3"
            placeholder="Current Password"
            disabled={isLoading}
          />
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none mb-3"
            placeholder="New Password"
            disabled={isLoading}
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none"
            placeholder="Confirm New Password"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-white font-bold"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;