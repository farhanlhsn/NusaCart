import React from "react";
import { Link } from "react-router-dom";
import error from "../assets/404.png";

export default function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center bg-white h-full pb-[50px] md:pb-[100px] px-4">
            <img src={error} alt="Error" className="w-[200px] md:w-[300px] object-contain" />
            <div className="flex flex-col gap-[16px] items-center justify-center pb-[16px]">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 text-center pb-[16px]">404 <br /> Halaman Tidak Ditemukan</h1>
                <p className="text-sm md:text-base text-gray-600 text-center">Maaf, halaman yang Anda cari tidak ada.</p>
            </div>
            <Link to="/" className="px-4 md:px-6 py-2 md:py-3 bg-[#E64646] text-white rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base">
                Kembali ke Beranda
            </Link>
        </div>
    )
}