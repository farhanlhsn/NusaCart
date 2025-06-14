import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import successIconSvg from "../assets/successIcon.svg";
import useRegisterStore from "../stores/registerStore";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

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

export default function UserRegisterPage() {
	const { setSuccess, reset } = useRegisterStore();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
        phoneNumber: ""
	});
	const [error, setError] = useState("");
	const [success, setSuccessMessage] = useState("");
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
		if (success && currentStep !== 2) {
			const timer = setTimeout(() => {
				setSuccessMessage("");
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [success, currentStep]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");
		setIsLoading(true);
		
		try {
			console.log("Sending data to server:", formData);
			const response = await axios.post("/api/auth/register", formData);
			
			if (response.status === 201 || response.status === 200) {
				console.log("Registration successful:", response.data);
				setSuccess(true);
				setSuccessMessage("Kode verifikasi telah dikirim ke WhatsApp Anda!");
				// Redirect ke halaman verifikasi dengan email sebagai parameter
				navigate(`/verify-registration?email=${encodeURIComponent(formData.email)}`);
			}
		} catch (error) {
			console.error("Registration error details:", {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status,
				headers: error.response?.headers
			});

			if (error.response) {
				const errorMessage = error.response.data?.message || '';
				const statusCode = error.response.status;
				
				if (statusCode === 409) {
					setError("Email sudah terdaftar. Silakan gunakan email lain.");
				} else if (statusCode === 400) {
					setError(errorMessage || "Data yang dimasukkan tidak valid.");
				} else if (statusCode === 500) {
					setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
				} else {
					setError(errorMessage || "Terjadi kesalahan saat mendaftar.");
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

	const goBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setError("");
			setSuccessMessage("");
		} else {
			navigate(-1);
		}
	};

	const getStepTitle = () => {
		switch (currentStep) {
			case 1: return "Daftar Sekarang";
			case 2: return "Selamat Anda Berhasil Melakukan Pendaftaran!";
			default: return "Daftar Sekarang";
		}
	};

	const getStepSubtitle = () => {
		switch (currentStep) {
			case 1: return "Lengkapi data diri Anda untuk membuat akun";
			case 2: return "Silakan masuk untuk mengakses NusaCart";
			default: return "";
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<form className="w-full max-w-md space-y-3 md:space-y-4" onSubmit={handleSubmit}>
						<div>
							<label className="block text-white text-sm mb-2 text-left">Nama</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className="w-full px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-white text-black focus:outline-none text-sm md:text-base"
								placeholder="Athallah Zacky Maulana"
								required
								disabled={isLoading}
							/>
						</div>
						<div>
							<label className="block text-white text-sm mb-2 text-left">Email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="w-full px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-white text-black focus:outline-none text-sm md:text-base"
								placeholder="zacky@gmail.com"
								required
								disabled={isLoading}
							/>
						</div>
						<div>
							<label className="block text-white text-sm mb-2 text-left">Password</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="w-full px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-white text-black focus:outline-none text-sm md:text-base"
								placeholder="Minimal 8 karakter"
								required
								minLength={8}
								disabled={isLoading}
							/>
						</div>
						<div>
							<label className="block text-white text-sm mb-2 text-left">Nomor Telepon</label>
							<input
								type="tel"
								name="phoneNumber"
								value={formData.phoneNumber}
								onChange={handleChange}
								className="w-full px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-white text-black focus:outline-none text-sm md:text-base"
								placeholder="6281234567890"
								required
								disabled={isLoading}
							/>
						</div>
						<button
							type="submit"
							className="w-full py-2 md:py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isLoading}
						>
							{isLoading ? "Mendaftar..." : "Daftar"}
						</button>
						<div className="text-center text-white/70 text-xs md:text-sm">
							Sudah punya akun? <a href="/login" className="text-[#FFCE86] font-bold">Masuk</a>
						</div>
					</form>
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
								onClick={() => {
									reset();
									navigate("/login");
								}}
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

			{success && currentStep !== 2 && (
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
				
				{/* Kanan: Form Register */}
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
}