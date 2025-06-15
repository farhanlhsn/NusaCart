import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import successIconSvg from "../assets/successIcon.svg";
import { ArrowLeft, RefreshCw, Edit3, Phone } from "lucide-react";
import axios from "axios";
import { authAPI, maskPhoneNumber } from "../services/api";

// Add custom CSS for animations
const toastStyles = `
  @keyframes slideDown {
    from {
      transform: translate(-50%, -100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
  
  .animate-slide-down {
    animation: slideDown 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = toastStyles;
  document.head.appendChild(styleSheet);
}

// CheckIcon component using the imported SVG
const CheckIcon = ({ className }) => (
    <img src={successIconSvg} alt="Success" className={className} />
);

const VerifyRegistrationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const fetchingRef = useRef(false);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [showPhoneEdit, setShowPhoneEdit] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    
    // New states for email editing
    const [showEmailEdit, setShowEmailEdit] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    
    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }
        
        // Fetch registration info to get phone number
        fetchRegistrationInfo();
        
        // Cleanup function to prevent multiple calls
        return () => {
            setIsLoadingInfo(false);
            fetchingRef.current = false;
        };
    }, [email, navigate]);

    const fetchRegistrationInfo = async () => {
        // Prevent multiple simultaneous calls
        if (fetchingRef.current) {
            return;
        }
        
        try {
            fetchingRef.current = true;
            setIsLoadingInfo(true);
            const response = await authAPI.getRegistrationInfo({ email });
            if (response.data.phoneNumber) {
                setPhoneNumber(response.data.phoneNumber);
            }
        } catch (error) {
            console.error("Error fetching registration info:", error);
            
            // Handle specific error cases
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes("already registered and verified")) {
                    // User is already verified, redirect immediately to login
                    navigate('/login', { 
                        replace: true,
                        state: { 
                            message: "Akun sudah terdaftar dan terverifikasi. Silakan login.",
                            type: "info"
                        }
                    });
                    return;
                } else if (errorMessage.includes("Registration was incomplete")) {
                    setError("Registrasi belum selesai. Silakan daftar ulang untuk menyelesaikan verifikasi.");
                    setTimeout(() => {
                        navigate('/register');
                    }, 3000);
                    return;
                } else if (errorMessage.includes("No pending registration")) {
                    setError("Sesi registrasi tidak ditemukan. Silakan daftar ulang.");
                    setTimeout(() => {
                        navigate('/register');
                    }, 3000);
                    return;
                }
            }
            // If failed to get info, still allow user to proceed with default phone
        } finally {
            setIsLoadingInfo(false);
            fetchingRef.current = false;
        }
    };
    
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Auto hide notifications after 4 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (successMessage && currentStep !== 2) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, currentStep]);
    
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
                setCurrentStep(2);
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
                setSuccessMessage("Kode verifikasi baru telah dikirim ke WhatsApp Anda:.");
                // Update phone number if returned
                if (response.data.phoneNumber) {
                    setPhoneNumber(response.data.phoneNumber);
                }
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
                // Update phone number in state
                if (response.data.phoneNumber) {
                    setPhoneNumber(response.data.phoneNumber);
                }
                // Reset countdown untuk resend OTP
                setCountdown(0);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal memperbarui nomor telepon';
            setError(errorMessage);
        } finally {
            setIsUpdatingPhone(false);
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) {
            setError('Email tidak boleh kosong');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            setError('Format email tidak valid');
            return;
        }

        setIsUpdatingEmail(true);
        try {
            const response = await authAPI.updateEmailRegistration({
                oldEmail: email,
                newEmail: newEmail,
                phoneNumber: phoneNumber
            });

            if (response.data.status === 'email_updated') {
                setSuccessMessage(response.data.message);
                setShowEmailEdit(false);
                setNewEmail('');
                
                // Redirect to new email verification page
                setTimeout(() => {
                    navigate(`/verify-registration?email=${encodeURIComponent(newEmail)}`, { replace: true });
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal memperbarui email';
            setError(errorMessage);
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError("");
            setSuccessMessage("");
        } else {
            navigate('/register');
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return "Verifikasi Akun";
            case 2: return "Selamat! Akun Anda Berhasil Diverifikasi";
            default: return "Verifikasi Akun";
        }
    };

    const getStepSubtitle = () => {
        switch (currentStep) {
            case 1: return `Masukkan kode verifikasi yang telah dikirim ke WhatsApp Anda${phoneNumber ? ': ' + maskPhoneNumber(phoneNumber) : ''}`;
            case 2: return "Silakan masuk untuk mengakses NusaCart";
            default: return "";
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="w-full max-w-md space-y-4 md:space-y-6">
                        {/* Email Info */}
                        <div className="text-center mb-4">
                            <p className="text-white/80 text-sm">
                                Email: <span className="font-medium">
                                    {isLoadingInfo ? "Loading..." : email}
                                </span>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-white text-sm mb-2 text-left">
                                    Kode Verifikasi
                                </label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-white text-black focus:outline-none text-sm md:text-base text-center tracking-widest"
                                    placeholder="Masukkan 4 digit kode"
                                    maxLength="4"
                                    pattern="[0-9]{4}"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.length !== 4}
                                className="w-full py-2 md:py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="mt-6 p-4 bg-white/10 rounded-2xl">
                                <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Ganti Nomor Telepon
                                </h3>
                                <form onSubmit={handleUpdatePhoneNumber} className="space-y-3">
                                    <input
                                        type="tel"
                                        value={newPhoneNumber}
                                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white text-black focus:outline-none text-sm"
                                        placeholder="08123456789 atau 6281234567890"
                                        required
                                        disabled={isUpdatingPhone}
                                    />
                                    <p className="text-white/70 text-xs">
                                        Format: 08xxxxxxxxx atau 62xxxxxxxxx
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            type="submit"
                                            disabled={isUpdatingPhone || !newPhoneNumber.trim()}
                                            className="flex-1 bg-[#3E3E3E] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            className="flex-1 bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        {/* Resend OTP and Change Phone */}
                        <div className="mt-6 text-center space-y-3">
                            <p className="text-white/70 text-sm mb-3">
                                Tidak menerima kode?
                            </p>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={handleResendOTP}
                                    disabled={isResending || countdown > 0}
                                    className="text-[#FFCE86] hover:text-[#FFD700] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
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
                                    className="text-[#FFCE86] hover:text-[#FFD700] font-medium text-sm flex items-center justify-center mx-auto"
                                >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    {showPhoneEdit ? "Tutup" : "Ganti Nomor Telepon"}
                                </button>
                            </div>
                        </div>
                        
                        {/* Email Edit Form */}
                        {showEmailEdit && (
                            <div className="mt-6 p-4 bg-white/10 rounded-2xl">
                                <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Ganti Email
                                </h3>
                                <form onSubmit={handleUpdateEmail} className="space-y-3">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white text-black focus:outline-none text-sm"
                                        placeholder="email@example.com"
                                        required
                                        disabled={isUpdatingEmail}
                                    />
                                    <p className="text-white/70 text-xs">
                                        Nomor telepon akan tetap sama: {maskPhoneNumber(phoneNumber)}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            type="submit"
                                            disabled={isUpdatingEmail || !newEmail.trim()}
                                            className="flex-1 bg-[#3E3E3E] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUpdatingEmail ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Memperbarui...
                                                </div>
                                            ) : (
                                                "Perbarui Email"
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEmailEdit(false);
                                                setNewEmail("");
                                            }}
                                            className="flex-1 bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        {/* Change Email Button */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setShowEmailEdit(!showEmailEdit)}
                                className="text-[#FFCE86] hover:text-[#FFD700] font-medium text-sm flex items-center justify-center mx-auto"
                            >
                                <Edit3 className="w-4 h-4 mr-1" />
                                {showEmailEdit ? "Tutup" : "Ganti Email"}
                            </button>
                        </div>
                        
                        {/* Back to Register */}
                        <div className="text-center text-white/70 text-xs md:text-sm mt-4">
                            Ingin daftar ulang? <button onClick={() => navigate('/register')} className="text-[#FFCE86] font-bold">Daftar Ulang</button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="w-full max-w-md text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center">
                                <CheckIcon className="w-20 h-20 md:w-24 md:h-24" />
                            </div>
                        </div>
                        
                        {/* Success Title */}
                        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                            {getStepTitle()}
                        </h2>
                        
                        {/* Success Subtitle */}
                        <h3 className="text-white/80 text-sm md:text-base mb-6">
                            {getStepSubtitle()}
                        </h3>
                        
                        <div className="pt-2">
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full py-2 md:py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg hover:bg-[#2a2a2a] transition-colors"
                            >
                                Masuk
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 md:gap-[10px] relative">
            {/* Toast Notifications */}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-down">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                            <button
                                onClick={() => setError("")}
                                className="ml-4 text-white hover:text-red-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && currentStep !== 2 && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-down">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                            <button
                                onClick={() => setSuccessMessage("")}
                                className="ml-4 text-white hover:text-green-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logo di atas, center */}
            <img
                src={logo}
                alt="NusaCart Logo"
                className="w-40 md:w-80 mb-8"
                onClick={() => navigate("/")}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-center bg-white rounded-3xl md:gap-[87px] w-full max-w-[1200px]">
                {/* Kiri: Ilustrasi - Hide on success step */}
                {currentStep !== 2 && (
                    <div className="flex flex-col items-center justify-center bg-white mb-8 md:mb-0">
                        <img
                            src={asset}
                            alt="Illustration"
                            className="w-[280px] sm:w-[400px] md:w-[500px] mb-6 md:mb-10"
                        />
                    </div>
                )}
                
                {/* Kanan: Form Verifikasi */}
                <div className="relative flex flex-col justify-center items-center bg-[#E64646] rounded-3xl shadow-xl w-full max-w-[500px] min-h-[400px] px-6 sm:px-8 py-8 md:py-10">
                    {/* Back Button - Hide on success step */}
                    {currentStep !== 2 && (
                        <button
                            onClick={goBack}
                            className="absolute top-6 left-4 text-white hover:text-white/80 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    {/* Title and Subtitle - Hide on success step */}
                    {currentStep !== 2 && (
                        <>
                            <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-center">{getStepTitle()}</h2>
                            <h3 className="text-white/80 text-sm md:text-base mb-4 md:mb-6 text-center">{getStepSubtitle()}</h3>
                        </>
                    )}
                    
                    {/* Step Content */}
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default VerifyRegistrationPage;