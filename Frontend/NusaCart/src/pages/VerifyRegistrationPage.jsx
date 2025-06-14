import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import { ArrowLeft, RefreshCw, Edit3, Phone } from "lucide-react";
import axios from "axios";
import { authAPI } from "../services/api";

const VerifyRegistrationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [showPhoneEdit, setShowPhoneEdit] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
    
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);
    
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);
    
    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);
        
        try {
            const response = await axios.post("/api/auth/verify-registration", {
                email: email,
                verificationCode: parseInt(verificationCode)
            });
            
            if (response.status === 200) {
                setSuccessMessage("Verifikasi berhasil! Akun Anda telah aktif.");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            console.error("Verification error:", error);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || '';
                const statusCode = error.response.status;
                
                if (statusCode === 400) {
                    setError(errorMessage || "Kode verifikasi tidak valid.");
                } else if (statusCode === 404) {
                    setError("Tidak ada pendaftaran yang ditemukan untuk email ini.");
                } else {
                    setError(errorMessage || "Terjadi kesalahan saat verifikasi.");
                }
            } else {
                setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResendOTP = async () => {
        setError("");
        setSuccessMessage("");
        setIsResending(true);
        
        try {
            const response = await axios.post("/api/auth/resend-registration-otp", {
                email: email
            });
            
            if (response.status === 200) {
                setSuccessMessage("Kode verifikasi baru telah dikirim ke WhatsApp Anda.");
                setCountdown(60); // 60 detik countdown
            }
        } catch (error) {
            console.error("Resend OTP error:", error);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || '';
                setError(errorMessage || "Gagal mengirim ulang kode verifikasi.");
            } else {
                setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
            }
        } finally {
            setIsResending(false);
        }
    };
    
    const handleUpdatePhoneNumber = async (e) => {
        e.preventDefault();
        if (!newPhoneNumber.trim()) {
            setError('Nomor telepon tidak boleh kosong');
            return;
        }

        setIsUpdatingPhone(true);
        try {
            const response = await authAPI.updatePhoneRegistration({
                email: email,
                phoneNumber: newPhoneNumber
            });

            if (response.data.status === 'phone_updated') {
                setSuccessMessage(response.data.message);
                setShowPhoneEdit(false);
                setNewPhoneNumber('');
                // Reset countdown untuk resend OTP
                setCountdown(0);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Gagal memperbarui nomor telepon');
        } finally {
            setIsUpdatingPhone(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex">
            {/* Kiri: Gambar */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
                <div className="max-w-md">
                    <img
                        src={asset}
                        alt="Verification illustration"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>
            
            {/* Kanan: Form Verifikasi */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <img src={logo} alt="NusaCart Logo" className="mx-auto mb-4 h-12" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Verifikasi Akun
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Masukkan kode verifikasi yang telah dikirim ke WhatsApp Anda
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                            Email: {email}
                        </p>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}
                    
                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            {successMessage}
                        </div>
                    )}
                    
                    {/* Form */}
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kode Verifikasi
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
                                placeholder="Masukkan 4 digit kode"
                                maxLength="4"
                                pattern="[0-9]{4}"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading || verificationCode.length !== 4}
                            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#E55A2B] hover:to-[#E8851A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Memverifikasi...
                                </div>
                            ) : (
                                "Verifikasi Akun"
                            )}
                        </button>
                    </form>
                    
                    {/* Phone Number Edit Form */}
                    {showPhoneEdit && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                Ganti Nomor Telepon
                            </h3>
                            <form onSubmit={handleUpdatePhoneNumber} className="space-y-3">
                                <input
                                    type="tel"
                                    value={newPhoneNumber}
                                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                    placeholder="Masukkan nomor telepon baru"
                                    required
                                />
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPhone || !newPhoneNumber.trim()}
                                        className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdatingPhone ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Memperbarui...
                                            </div>
                                        ) : (
                                            "Perbarui"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPhoneEdit(false);
                                            setNewPhoneNumber("");
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {/* Resend OTP and Change Phone */}
                    <div className="mt-6 text-center space-y-3">
                        <p className="text-gray-600 text-sm mb-3">
                            Tidak menerima kode?
                        </p>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={handleResendOTP}
                                disabled={isResending || countdown > 0}
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                            >
                                <RefreshCw className={`w-4 h-4 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                                {countdown > 0 ? (
                                    `Kirim ulang dalam ${countdown}s`
                                ) : isResending ? (
                                    "Mengirim..."
                                ) : (
                                    "Kirim ulang kode"
                                )}
                            </button>
                            
                            <button
                                onClick={() => setShowPhoneEdit(!showPhoneEdit)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center mx-auto"
                            >
                                <Edit3 className="w-4 h-4 mr-1" />
                                {showPhoneEdit ? "Tutup" : "Ganti Nomor Telepon"}
                            </button>
                        </div>
                    </div>
                    
                    {/* Back to Register */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Kembali ke Pendaftaran
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyRegistrationPage;