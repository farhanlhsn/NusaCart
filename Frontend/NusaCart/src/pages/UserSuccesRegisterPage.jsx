import React from "react";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";
import success from "../assets/CircleCheck.png";
import useRegisterStore from "../stores/registerStore";

export default function UserSuccesRegisterPage() {
	const { reset } = useRegisterStore();

	const handleLogin = () => {
		reset(); // Reset state sebelum navigasi
		window.location.href = "/login";
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
				{/* Kanan: Form Success Register */}
				<div className="flex flex-col justify-center items-center bg-[#E64646] rounded-3xl shadow-xl w-full max-w-[500px] h-auto md:h-[550px] px-4 sm:px-6 py-6 md:py-8">
					<img src={success} alt="Circle Check" className="" />
					<h2 className="text-white text-2xl md:text-3xl font-bold text-center pt-[26px] pb-[20px]">Selamat Anda Berhasil Melakukan Pendaftaran!</h2>
					<p className="text-white/70 text-sm md:text-base text-center pb-[20px]">Silakan masuk untuk mengakses NusaCart</p>
					<button 
						onClick={handleLogin}
						className="w-full py-2 md:py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-base md:text-lg"
					>
						Masuk
					</button>
				</div>
			</div>
		</div>
	);
}