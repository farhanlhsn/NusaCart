import React, { useEffect } from "react";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
	const { isLoggedIn, login } = useAuthStore();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);
		
		try {
			console.log("Sending data to server:", formData);
			// Use authStore login method instead of direct API call to avoid double request
			const result = await login(formData);
			
			console.log("Login successful:", result);
			
			// Check if user is verified
			if (result.user && !result.user.isVerified) {
				setSuccess("Login berhasil! Mengalihkan ke halaman verifikasi...");
				setTimeout(() => {
					navigate(`/verify-registration?email=${encodeURIComponent(result.user.email)}`);
				}, 1500);
			} else {
				setSuccess("Login berhasil! Mengalihkan...");
				setTimeout(() => {
					navigate("/home");
				}, 1500);
			}

		} catch (error) {
			console.error("Login error:", error);
			if (error.response) {
				if (error.response.status === 500) {
					setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
				} else {
					setError(`${error.response.data?.message || 'Login gagal'}`);
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

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 md:gap-[72px] px-4">
			{/* Logo di atas, center */}
			<img
				src={logo}
				alt="NusaCart Logo"
				className="w-40 md:w-80"
				onClick={() => navigate("/")}
			/>
			{/* Container dua kolom */}
			<div className="flex flex-col md:flex-row items-center justify-center bg-white rounded-3xl md:gap-[87px] w-full max-w-[1200px] md:h-[600px]">
				{/* Kiri: Ilustrasi */}
				<div className="flex flex-col items-center justify-center bg-white mb-8 md:mb-0">
					<img
						src={asset}
						alt="Illustration"
						className="w-[280px] sm:w-[400px] md:w-[500px] mb-6 md:mb-10"
					/>
				</div>
				{/* Kanan: Form Login */}
				<div className="flex flex-col justify-center items-center bg-[#E64646] rounded-3xl shadow-xl w-full max-w-[500px] h-auto md:h-[500px] px-4 sm:px-6 py-6 md:py-8">
					<h2 className="text-white text-2xl md:text-3xl font-bold mb-5 md:mb-7">Masuk</h2>
					{error && (
						<div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 animate-pulse" role="alert">
							<div className="flex items-center">
								<svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
								<span className="block sm:inline font-medium">{error}</span>
								<button
									onClick={() => setError("")}
									className="ml-auto text-red-700 hover:text-red-900"
								>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					)}
					{success && (
						<div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 animate-pulse" role="alert">
							<div className="flex items-center">
								<svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								<span className="block sm:inline font-medium">{success}</span>
							</div>
						</div>
					)}
					<form className="w-full max-w-md space-y-3 md:space-y-4" onSubmit={handleSubmit}>
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
								placeholder="@Zacky25"
								required
								disabled={isLoading}
							/>
						</div>
						<div className="flex justify-end">
							<a href="/forgot" className="text-[#FFCE86] text-xs md:text-sm">Lupa password?</a>
						</div>
						<button
							type="submit"
							className="w-full py-2 md:py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg"
							disabled={isLoading}
						>
							{isLoading ? "Masuk..." : "Masuk"}
						</button>
						<div className="text-center text-white text-xs md:text-sm">
							Belum punya akun? <a href="/register" className="text-[#FFCE86] font-bold">Daftar</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}