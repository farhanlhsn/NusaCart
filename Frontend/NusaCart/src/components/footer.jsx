import React from "react"
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { LuSendHorizontal, LuShoppingBag, LuHeart, LuUser } from "react-icons/lu";
import NusaCartLogo from "../assets/NusaCartLogo.svg";
import NusaCartTitle from "../assets/NusaCartTitle.svg";
import { useNavigate } from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate();
    
    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (email) {
            alert(`Newsletter subscription: ${email}`);
            e.target.email.value = '';
        }
    };

    return(
        <div className="bg-gradient-to-br from-[#E64646] via-[#DC3545] to-[#C82333] text-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Newsletter Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <FaEnvelope className="w-5 h-5" />
                                </div>
                                <div>
                                    <img src={NusaCartTitle} alt="NusaCart" className="h-6 w-auto filter brightness-0 invert" />
                                    <p className="text-white/80 text-sm">Stay Connected</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
                            <p className="text-white/80 text-sm mb-4">Get 10% off your first order and stay updated with our latest offers!</p>
                            <form onSubmit={handleNewsletterSubmit} className="relative">
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Enter your email address" 
                                    className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 placeholder-white/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                                    required
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors">
                                    <LuSendHorizontal className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-white rounded-full"></div>
                            Quick Links
                        </h2>
                        <div className="space-y-3">
                            <button className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 group w-full text-left">
                                <LuShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Toko</span>
                            </button>
                            <button onClick={() => navigate('/wishlist')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 group w-full text-left">
                                <LuHeart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Wishlist</span>
                            </button>
                            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 group w-full text-left">
                                <LuUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Akun Saya</span>
                            </button>
                            <button onClick={() => navigate('/cart')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 w-full text-left">
                                <span>Keranjang</span>
                            </button>
                            <button onClick={() => navigate('/login')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 w-full text-left">
                                <span>Masuk / Daftar</span>
                            </button>
                        </div>
                    </div>

                    {/* Support & Contact */}
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-white rounded-full"></div>
                            Support
                        </h2>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/faq')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 w-full text-left">
                                <span>FAQ</span>
                            </button>
                            <button onClick={() => navigate('/kontak')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 w-full text-left">
                                <span>Contact Us</span>
                            </button>
                            <button onClick={() => navigate('/terms')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 w-full text-left">
                                <span>Terms of Use</span>
                            </button>
                            <button onClick={() => navigate('/privacy')} className="flex items-center gap-3 text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 w-full text-left">
                                <span>Privacy Policy</span>
                            </button>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="mt-8 space-y-2">
                            <div className="flex items-center gap-3 text-white/80 text-sm">
                                <FaPhone className="w-4 h-4" />
                                <span>+62 812 3456 7890</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80 text-sm">
                                <FaMapMarkerAlt className="w-4 h-4" />
                                <span>Bandung, Indonesia</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-white/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <img src={NusaCartLogo} alt="NusaCart Logo" className="w-8 h-8" />
                            </div>
                            <div>
                                <img src={NusaCartTitle} alt="NusaCart" className="h-6 w-auto filter brightness-0 invert" />
                                <p className="text-white/60 text-sm">Your Trusted Marketplace</p>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="flex items-center gap-4">
                            <span className="text-white/60 text-sm mr-2">Follow us:</span>
                            <a href="https://instagram.com/nusacart" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                                <FaInstagram className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com/nusacart" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a href="https://facebook.com/nusacart" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                                <FaFacebook className="w-5 h-5" />
                            </a>
                            <a href="https://youtube.com/nusacart" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm">
                                <FaYoutube className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-center md:text-right">
                            <p className="text-white/60 text-sm">© 2025 NusaCart. All rights reserved.</p>
                            <p className="text-white/40 text-xs mt-1">Made with ❤️ in Indonesia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}