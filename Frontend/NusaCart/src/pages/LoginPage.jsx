import React from "react";
import "../pages/LoginPage.css";
import logo from "../assets/Logo.png";
import asset from "../assets/loginNregister.png";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white gap-[72px]">
			{/* Logo di atas, center */}
			<img
				src={logo}
				alt="NusaCart Logo"
				className="w-60 mb-8 mt-8"
			/>
			{/* Container dua kolom */}
			<div className="flex flex-col md:flex-row items-center justify-center bg-white rounded-3xl md:gap-[87px] w-full md:w-[1200px] md:h-[600px]">
				{/* Kiri: Ilustrasi */}
				<div className="flex flex-col items-center justify-center bg-white mb-8 md:mb-0">
					<img
						src={asset}
						alt="Illustration"
						className="w-[500px] mb-10"
					/>
				</div>
				{/* Kanan: Form Login */}
				<div className="flex flex-col justify-center items-center bg-[#E64646] rounded-3xl shadow-xl w-full max-w-[500px] h-auto md:h-[500px] px-6 py-8">
					<h2 className="text-white text-3xl font-bold mb-7">Masuk</h2>
					<form className="w-full max-w-md space-y-4">
						<div>
							<label className="block text-white text-sm mb-2 text-left">Email</label>
							<input
								type="email"
								className="w-full px-6 py-3 rounded-2xl bg-white text-black focus:outline-none"
								placeholder="zacky@gmail.com"
							/>
						</div>
						<div>
							<label className="block text-white text-sm mb-2 text-left">Password</label>
							<input
								type="password"
								className="w-full px-6 py-3 rounded-2xl bg-white text-black focus:outline-none"
								placeholder="@Zacky25"
							/>
						</div>
						<div className="flex justify-end">
							<a href="#" className="text-[#FFCE86] text-sm">Lupa password?</a>
						</div>
						<button
							type="submit"
							className="w-full py-3 rounded-2xl bg-[#3E3E3E] text-white font-bold text-lg"
						>
							Masuk
						</button>
						<div className="text-center text-white text-sm">
							Belum punya akun? <a href="#" className="text-[#FFCE86] font-bold">Daftar</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}