import React from "react"
import logo from "../assets/logoFooter.png"
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa";
import { LuSendHorizontal } from "react-icons/lu";

export default function Footer() {
    return(
        <div className="flex flex-col md:flex-row items-center justify-center bg-[#E64646] px-6 py-5 text-white gap-60">
            <div className="flex flex-col md:flex-row items-center justify-center bg-[#E64646] px-6 py-19 text-white gap-30">
                <div className="flex flex-col items-left justify-start gap-4">
                    <h1 className="text-white text-left font-bold text-xl">NUSACART</h1>
                    <button className="text-white text-left font-semibold text-m">Subscribe</button>
                    <h3 className="text-white text-left">Get 10% off your first order</h3>
                    <div className="relative w-full">
                        <input 
                            type="email" 
                            placeholder="Enter Your Email" 
                            className="w-full px-4 py-3 rounded-xl outline pr-12"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                            <LuSendHorizontal className="w-7 h-7 hover:text-blue-400" />
                        </button>
                    </div>
                        
                </div>
                <div className="flex flex-col items-left justify-start gap-4">
                    <h1 className="text-white text-left font-bold text-l">Support</h1>
                    <h3>FAQ</h3>
                    <h3>Contact</h3>
                    <h3>Terms Of Use</h3>
                    <h3>Privacy Policy</h3>
                </div>
                <div className="flex flex-col items-left justify-start gap-2">
                    <h1 className="text-white text-left font-bold text-l">Akun</h1>
                    <h3>Akun Saya</h3>
                    <h3>Masuk / Daftar</h3>
                    <h3>Keranjang</h3>
                    <h3>Wishlist</h3>
                    <h3>Toko</h3>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-5">
                <img src={logo} alt="NusaCart Logo" className="w-80" />
                <div className="flex gap-15 mt-4">
                    <a href="https://instagram.com/yourusername" target="_blank" rel="noopener noreferrer">
                        <FaInstagram className="w-8 h-8 hover:text-pink-500 transition" />
                    </a>
                    <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
                        <FaTwitter className="w-8 h-8 hover:text-blue-400 transition" />
                    </a>
                    <a href="https://facebook.com/yourusername" target="_blank" rel="noopener noreferrer">
                        <FaFacebook className="w-8 h-8 hover:text-blue-600 transition" />
                    </a>
                    <a href="https://youtube.com/yourusername" target="_blank" rel="noopener noreferrer">
                        <FaYoutube className="w-8 h-8 hover:text-red-600 transition" />
                    </a>
                </div>
            </div>
        </div>
    )
}