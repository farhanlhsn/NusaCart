import React, { useEffect } from "react";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import useAuthStore from "../stores/authStore";	
import api from "../services/api";
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
		setIsLoading(true);
		
		try {
			console.log("Sending data to server:", formData);
			const response = await api.post("/api/auth/login", formData);
			
			if (response.status === 200) {
				console.log("Login successful:", response.data);
				login(response.data);
				navigate("/home");
			}

		} catch (error) {
			console.error("Login error:", error);
			if (error.response) {
				if (error.response.status === 401) {
					setError("Email atau password salah");
				} else if (error.response.status === 500) {
					setError("Terjadi kesalahan pada server");
				}
			} else {
				setError("Terjadi kesalahan pada server");
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
						<div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
							<span className="block sm:inline">{error}</span>
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
							<a href="#" className="text-[#FFCE86] text-xs md:text-sm">Lupa password?</a>
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