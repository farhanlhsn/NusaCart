import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import useRegisterStore from "../stores/registerStore";
import axios from "axios";

export default function UserRegisterPage() {
	const { setSuccess } = useRegisterStore();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
        phoneNumber: ""
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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
			const response = await axios.post("/api/auth/register", formData);
			
			if (response.status === 201 || response.status === 200) {
				console.log("Registration successful:", response.data);
				setSuccess(true);
				navigate("/register/success");
			}
		} catch (error) {
			console.error("Registration error details:", {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status,
				headers: error.response?.headers
			});

			if (error.response) {
				// Server responded with error
				setError(error.response.data.message || "Terjadi kesalahan saat mendaftar");
			} else if (error.request) {
				// No response received
				setError("Tidak dapat terhubung ke server. Pastikan server backend berjalan di port 6060.");
			} else {
				// Other errors
				setError("Terjadi kesalahan saat mendaftar: " + error.message);
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
				{/* Kanan: Form Register */}
				<div className="flex flex-col justify-center items-center bg-[#E64646] rounded-3xl shadow-xl w-full max-w-[500px] h-auto md:h-[600px] px-4 sm:px-6 py-6 md:py-8">
					<h2 className="text-white text-2xl md:text-3xl font-bold mb-5 md:mb-7">Daftar Sekarang</h2>
					{error && (
						<div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
							<span className="block sm:inline">{error}</span>
						</div>
					)}
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
								placeholder="081234567890"
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
				</div>
			</div>
		</div>
	);
}