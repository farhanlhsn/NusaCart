import React, { useEffect } from "react";
import logo from "../assets/Logo.png";
import useAuthStore from "../stores/authStore";	
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import successIconSvg from "../assets/successIcon.svg";

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

export default function ForgetPasswordPage() {
    const { isLoggedIn, login } = useAuthStore();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		email: "",
		newPassword: "",
		confirmPassword: "",
		verificationCode: ""
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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
		if (success && currentStep !== 3) {
			const timer = setTimeout(() => {
				setSuccess("");
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [success, currentStep]);

	useEffect(() => {
		if (isLoggedIn) {
			navigate("/home");
		}
	}, [isLoggedIn, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Step 1: Send email and new password to initiate reset
	const handleInitiateReset = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validate passwords match
		if (formData.newPassword !== formData.confirmPassword) {
			setError("Password dan konfirmasi password tidak sama.");
			return;
		}

		if (formData.newPassword.length < 8) {
			setError("Password minimal 8 karakter.");
			return;
		}

		setIsLoading(true);
		
		try {
			console.log("Initiating password reset:", { email: formData.email });
			const response = await api.post("/api/auth/forget_password", { 
				email: formData.email,
				newPassword: formData.newPassword 
			});
			
			if (response.status === 200) {
				console.log("Password reset initiated:", response.data);
				setSuccess("Kode verifikasi telah dikirim ke WhatsApp Anda.");
				setCurrentStep(2);
			}

		} catch (error) {
			console.error("Initiate reset error:", error);
			if (error.response) {
				const errorMessage = error.response.data?.message || '';
				const statusCode = error.response.status;
				
                if (statusCode === 429) {
					setError("Terlalu banyak permintaan. Silakan tunggu beberapa menit.");
				} else if (statusCode === 500) {
					setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
				} else {
					setError(errorMessage || "Terjadi kesalahan saat mengirim kode verifikasi.");
				}
			} else if (error.request) {
				setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
			} else {
				setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Step 2: Verify code and complete password reset
	const handleVerifyAndReset = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);
		
		try {
			const response = await api.post("/api/auth/confirm_forget_password", { 
				verificationCode: parseInt(formData.verificationCode) 
			});
			
			if (response.status === 200) {
				setSuccess("Password berhasil diubah!");
				setCurrentStep(3);
			}

		} catch (error) {
			console.error("Verification error:", error);
			if (error.response) {
				const errorMessage = error.response.data?.message || '';
				setError(errorMessage || "Kode verifikasi tidak valid atau sudah kadaluarsa.");
			} else {
				setError("Terjadi kesalahan saat memverifikasi kode.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const goBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setError("");
			setSuccess("");
		} else {
			navigate(-1);
		}
	};

	const getStepTitle = () => {
		switch (currentStep) {
			case 1: return "Lupa Password?";
			case 2: return "Verifikasi Kode";
			case 3: return "Selamat Anda Berhasil Mengubah Password!";
			default: return "Lupa Password?";
		}
	};

	const getStepSubtitle = () => {
		switch (currentStep) {
			case 1: return "Masukkan email yang terdaftar dan password baru Anda";
			case 2: return "Masukkan kode verifikasi yang telah dikirim ke WhatsApp Anda";
			case 3: return "Silakan login kembali menggunakan password baru Anda.";
			default: return "";
		}
	};

	const renderProgressBar = () => (
		<div className="flex items-center justify-center mb-4 md:mb-6">
			{[1, 2, 3].map((step) => (
				<React.Fragment key={step}>
					<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
						step <= currentStep 
							? 'bg-white text-[#E64646]' 
							: 'bg-white/30 text-white/60'
					}`}>
						{step < currentStep ? <CheckIcon className="w-4 h-4" /> : step}
					</div>
					{step < 3 && (
						<div className={`w-12 h-1 mx-2 ${
							step < currentStep ? 'bg-white' : 'bg-white/30'
						}`} />
					)}
				</React.Fragment>
			))}
		</div>
	);

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<form className="w-full max-w-md space-y-4 md:space-y-5" onSubmit={handleInitiateReset}>
						<div>
							<label className="block text-white text-sm md:text-base font-medium mb-2 text-left">Email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="w-full px-4 md:px-5 py-3 rounded-2xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
								placeholder="zacky@gmail.com"
								required
								disabled={isLoading}
							/>
						</div>
						<div>
							<label className="block text-white text-sm md:text-base font-medium mb-2 text-left">Password Baru</label>
							<input
								type="password"
								name="newPassword"
								value={formData.newPassword}
								onChange={handleChange}
								className="w-full px-4 md:px-5 py-3 rounded-2xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
								placeholder="Minimal 8 karakter"
								required
								disabled={isLoading}
								minLength={8}
							/>
						</div>
						<div>
							<label className="block text-white text-sm md:text-base font-medium mb-2 text-left">Konfirmasi Password</label>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								className="w-full px-4 md:px-5 py-3 rounded-2xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
								placeholder="Ulangi password baru"
								required
								disabled={isLoading}
								minLength={8}
							/>
						</div>
						<div className="pt-3">
							<button
								type="submit"
								className="w-full py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg disabled:opacity-50 hover:bg-[#2E2E2E] transition-colors"
								disabled={isLoading}
							>
								{isLoading ? "Mengirim..." : "Kirim Kode"}
							</button>
						</div>
					</form>
				);

			case 2:
				return (
					<form className="w-full max-w-md space-y-5" onSubmit={handleVerifyAndReset}>
						<div>
							<label className="block text-white text-sm md:text-base font-medium mb-2 text-left">Kode Verifikasi</label>
							<input
								type="number"
								name="verificationCode"
								value={formData.verificationCode}
								onChange={handleChange}
								className="w-full px-4 py-4 rounded-2xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-white/50 text-lg md:text-xl text-center font-mono tracking-widest"
								placeholder="1234"
								required
								disabled={isLoading}
								maxLength={6}
							/>
						</div>
						<div className="pt-3">
							<button
								type="submit"
								className="w-full py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg disabled:opacity-50 hover:bg-[#2E2E2E] transition-colors"
								disabled={isLoading}
							>
								{isLoading ? "Memverifikasi..." : "Verifikasi"}
							</button>
						</div>
					</form>
				);

			case 3:
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
								className="w-full py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg hover:bg-[#2E2E2E] transition-colors"
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

			{success && currentStep !== 3 && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
					<div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-down">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								<span className="font-medium">{success}</span>
							</div>
							<button
								onClick={() => setSuccess("")}
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
				className="w-40 md:w-80 mb-[62px]"
			/>
			<div className="flex flex-col md:flex-row items-center justify-center bg-white rounded-3xl md:gap-[87px] w-full max-w-[1200px]">
				<div className="relative flex flex-col justify-center items-center bg-[#E64646] rounded-3xl shadow-xl w-full max-w-[500px] min-h-[400px] px-6 sm:px-8 py-8 md:py-10">
					{/* Back Button - Hide on success step */}
					{currentStep !== 3 && (
						<button
							onClick={goBack}
							className="absolute top-6 left-4 text-white hover:text-white/80 transition-colors"
						>
							<ArrowLeft size={24} />
						</button>
					)}

					{/* Progress Bar - Hide on success step */}
					{currentStep !== 3 && renderProgressBar()}

					{/* Title and Subtitle - Hide on success step */}
					{currentStep !== 3 && (
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
}