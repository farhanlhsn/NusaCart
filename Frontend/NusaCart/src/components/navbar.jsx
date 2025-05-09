import React from "react";
import logo from "../assets/Logo.png";
import { FaSearch, FaHeart, FaBell, FaShoppingCart, FaCommentDots, FaUser } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="w-full">
      {/* Bar merah di atas */}
      <div className="w-full h-12 bg-[#E64646]" />
      {/* Navbar utama */}
      <nav className="flex items-center justify-between bg-white px-20 py-4 shadow">
        {/* Kiri: Logo & Menu */}
        <div className="flex items-center gap-8">
          <img src={logo} alt="NusaCart Logo" className="h-10" />
          <div className="flex gap-8 ml-8 font-poppins gap-10">
            <a href="#" className="font-medium hover:underline underline-offset-8">Beranda</a>
            <a href="#" className="font-medium hover:underline underline-offset-8">Kontak</a>
            <a href="#" className="font-medium hover:underline underline-offset-8">Tentang</a>
          </div>
        </div>
        {/* Tengah: Search */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-gray-100 rounded-full px-6 py-2 w-[700px] max-w-full">
            <input
              type="text"
              placeholder="Apa yang Anda cari?"
              className="bg-transparent outline-none flex-1 text-center text-gray-500 font-poppins"
            />
            <FaSearch className="text-gray-400 ml-2" />
          </div>
        </div>
        {/* Kanan: Icon */}
        <div className="flex items-center gap-6 ml-8">
          <FaHeart className="w-6 h-6 cursor-pointer" />
          <FaBell className="w-6 h-6 cursor-pointer" />
          <FaShoppingCart className="w-6 h-6 cursor-pointer" />
          <FaCommentDots className="w-6 h-6 cursor-pointer" />
          <FaUser className="w-6 h-6 cursor-pointer" />
        </div>
      </nav>
    </div>
  );
}
