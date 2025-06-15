import React, { useState, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import api, { maskPhoneNumber } from '../services/api';
import ImageUpload from './ImageUpload';

const EditProfile = ({ onClose }) => {
  const { user, updateUser } = useAuthStore();
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
  
  // OTP Verification states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [changeType, setChangeType] = useState(''); // 'phone' or 'password'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpdate = (newImageUrl, responseData) => {
    // Update user state dengan foto profil baru
    updateUser({
      profilePicture: newImageUrl
    });
    setSuccess('Foto profil berhasil diperbarui dan dikompres');
    setTimeout(() => setSuccess(''), 3000);
  };

  // OTP Countdown effect
  React.useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

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

    // Check if phone number or password is being changed
    const isPhoneChanged = formData.phoneNumber !== user?.phoneNumber;
    const isPasswordChanged = formData.newPassword && formData.newPassword.trim() !== '';

    if (isPhoneChanged || isPasswordChanged) {
      // Need OTP verification
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

      setPendingChanges(updateData);
      
      let currentChangeType;
      if (isPhoneChanged && isPasswordChanged) {
        currentChangeType = 'both';
        setChangeType('both');
      } else if (isPhoneChanged) {
        currentChangeType = 'phone';
        setChangeType('phone');
      } else {
        currentChangeType = 'password';
        setChangeType('password');
      }

      // Request OTP
      await requestOTP(currentChangeType);
    } else {
      // No sensitive changes, update directly
      await updateProfileDirect();
    }
  };

  const requestOTP = async (currentChangeType) => {
    setIsLoading(true);
    const finalChangeType = currentChangeType || changeType;
    console.log('Requesting OTP with changeType:', finalChangeType);
    console.log('Form data:', formData);
    
    try {
      const requestData = {
        changeType: finalChangeType,
        newPhoneNumber: finalChangeType === 'phone' || finalChangeType === 'both' ? formData.phoneNumber : undefined
      };
      console.log('Request data:', requestData);
      
      const response = await api.post('/api/user/request-profile-otp', requestData);
      
      if (response.status === 200) {
        setShowOTPModal(true);
        setOtpCountdown(60);
        setSuccess('Kode verifikasi telah dikirim ke WhatsApp Anda');
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      setError(error.response?.data?.message || 'Gagal mengirim kode verifikasi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otpCode || otpCode.length !== 4) {
      setError('Masukkan kode verifikasi 4 digit');
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const response = await api.post('/api/user/verify-profile-otp', {
        verificationCode: parseInt(otpCode),
        changeType: changeType,
        updateData: pendingChanges
      });
      
      if (response.status === 200) {
        // Update user state
        updateUser({
          name: pendingChanges.name,
          email: pendingChanges.email,
          phoneNumber: pendingChanges.phoneNumber
        });
        
        setSuccess('Profil berhasil diperbarui');
        setShowOTPModal(false);
        setOtpCode('');
        setPendingChanges(null);
        setChangeType('');
        
        setTimeout(() => {
          setSuccess('');
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'Kode verifikasi tidak valid');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResendingOTP(true);
    try {
      const response = await api.post('/api/user/request-profile-otp', {
        changeType: changeType,
        newPhoneNumber: changeType === 'phone' || changeType === 'both' ? formData.phoneNumber : undefined
      });
      
      if (response.status === 200) {
        setOtpCountdown(60);
        setSuccess('Kode verifikasi baru telah dikirim');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Gagal mengirim ulang kode verifikasi');
    } finally {
      setIsResendingOTP(false);
    }
  };

  const updateProfileDirect = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      const response = await api.put('/api/user/update_profile', updateData);
      
      if (response.status === 200) {
        updateUser({
          name: updateData.name,
          email: updateData.email,
          phoneNumber: updateData.phoneNumber
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

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Verifikasi Perubahan
            </h3>
            
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm mb-2">
                {changeType === 'phone' && 'Kode verifikasi telah dikirim ke nomor WhatsApp baru Anda'}
                {changeType === 'password' && `Kode verifikasi telah dikirim ke WhatsApp: ${maskPhoneNumber(user?.phoneNumber)}`}
                {changeType === 'both' && 'Kode verifikasi telah dikirim ke nomor WhatsApp baru Anda'}
              </p>
              {changeType === 'phone' && (
                <p className="text-gray-500 text-xs">
                  {maskPhoneNumber(formData.phoneNumber)}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">
                Kode Verifikasi
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-500 text-center tracking-widest"
                placeholder="0000"
                maxLength="4"
                pattern="[0-9]{4}"
                disabled={isVerifyingOTP}
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleOTPVerification}
                disabled={isVerifyingOTP || otpCode.length !== 4}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingOTP ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memverifikasi...
                  </div>
                ) : (
                  'Verifikasi'
                )}
              </button>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleResendOTP}
                  disabled={isResendingOTP || otpCountdown > 0}
                  className="text-red-500 hover:text-red-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpCountdown > 0 ? (
                    `Kirim ulang dalam ${otpCountdown}s`
                  ) : isResendingOTP ? (
                    'Mengirim...'
                  ) : (
                    'Kirim ulang kode'
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtpCode('');
                    setPendingChanges(null);
                    setChangeType('');
                    setError('');
                  }}
                  className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;