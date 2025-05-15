import React from "react"
import logo from "../assets/logoFooter.png"
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa";
import { LuSendHorizontal } from "react-icons/lu";

export default function Footer() {
    return(
        <div className="bg-[#E64646] text-white">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Subscribe Section */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-xl font-bold">NUSACART</h1>
                        <button className="text-left font-semibold">Subscribe</button>
                        <h3 className="text-sm md:text-base">Get 10% off your first order</h3>
                        <div className="relative w-full">
                            <input 
                                type="email" 
                                placeholder="Enter Your Email" 
                                className="w-full px-4 py-2 md:py-3 rounded-xl outline text-white text-sm md:text-base"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                                <LuSendHorizontal className="w-6 h-6 md:w-7 md:h-7 hover:text-blue-400" />
                            </button>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-lg font-bold">Support</h1>
                        <div className="flex flex-col gap-2 text-sm md:text-base">
                            <a href="#" className="hover:text-gray-200">FAQ</a>
                            <a href="#" className="hover:text-gray-200">Contact</a>
                            <a href="#" className="hover:text-gray-200">Terms Of Use</a>
                            <a href="#" className="hover:text-gray-200">Privacy Policy</a>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-lg font-bold">Akun</h1>
                        <div className="flex flex-col gap-2 text-sm md:text-base">
                            <a href="#" className="hover:text-gray-200">Akun Saya</a>
                            <a href="#" className="hover:text-gray-200">Masuk / Daftar</a>
                            <a href="#" className="hover:text-gray-200">Keranjang</a>
                            <a href="#" className="hover:text-gray-200">Wishlist</a>
                            <a href="#" className="hover:text-gray-200">Toko</a>
                        </div>
                    </div>

                    {/* Logo & Social Media */}
                    <div className="flex flex-col items-center md:items-start gap-5 justify-center">
                        <a href="/"><img src={logo} alt="NusaCart Logo" className="w-48 md:w-80" /></a>
                        <div className="flex gap-6">
                            <a href="https://instagram.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <FaInstagram className="w-6 h-6 md:w-8 md:h-8 hover:text-pink-500" />
                            </a>
                            <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <FaTwitter className="w-6 h-6 md:w-8 md:h-8 hover:text-blue-400" />
                            </a>
                            <a href="https://facebook.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <FaFacebook className="w-6 h-6 md:w-8 md:h-8 hover:text-blue-600" />
                            </a>
                            <a href="https://youtube.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <FaYoutube className="w-6 h-6 md:w-8 md:h-8 hover:text-red-600" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}