import React, { useState, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import api from '../services/api';

const EditProfile = ({ onClose }) => {
  const { user, login } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const response = await api.post('/api/user/change_Profile_Picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        // Update user data in store with new profile picture
        login({
          ...useAuthStore.getState(),
          user: {
            ...user,
            profilePicture: response.data.profilePicture
          }
        });
        setSuccess('Foto profil berhasil diperbarui');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Gagal mengunggah foto profil');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validasi password jika diisi
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
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
      };

      // Tambahkan password jika diubah
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put('/api/user/profile', updateData);
      
      if (response.status === 200) {
        // Update user data in store
        login({
          ...useAuthStore.getState(),
          user: {
            ...user,
            name: updateData.name,
            email: updateData.email
          }
        });
        setSuccess('Profil berhasil diperbarui');
        setTimeout(() => {
          setSuccess('');
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Password saat ini tidak valid');
      } else if (error.response?.status === 409) {
        setError('Email sudah digunakan');
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
        <div className="flex items-center">
          <span className="text-white mr-4">Ganti Foto Profil</span>
          <div 
            className="w-12 h-12 bg-white rounded-full cursor-pointer flex items-center justify-center overflow-hidden"
            onClick={handleProfilePictureClick}
          >
            {user?.profilePicture ? (
              <img 
                src={`http://localhost:6060${user.profilePicture}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-gray-400">+</span>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white text-sm mb-2">Nama Depan</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none"
              placeholder="Md"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-2">Nama Belakang</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-white text-black focus:outline-none"
              placeholder="Rimel"
              disabled={isLoading}
            />
          </div>
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