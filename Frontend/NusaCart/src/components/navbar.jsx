import React, { useState, useEffect } from "react";
import logo from "../assets/Logo.png";
import {
  HeartIcon,
  BellIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import "./navbar.css";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const profileImageUrl = user && user.profilePicture 
        ? `http://localhost:6060${user.profilePicture}` 
        : null; 


  return (
    <div className={`navbar-container ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Bar merah di atas */}
      <div className="top-bar" />
      
      {/* Navbar utama */}
      <nav className="main-nav">
        <div className="nav-content">
          {/* Kiri: Logo & Menu */}
          <div className="nav-left">
            <a href="/"><img src={logo} alt="NusaCart Logo" className="logo" /></a>
            {/* Desktop Menu */}
            <div className="desktop-menu">
              <a href="/" className="menu-item">Beranda</a>
              <a href="/contact" className="menu-item">Kontak</a>
              <a href="/about" className="menu-item">Tentang</a>
            </div>
          </div>

          {/* Tengah: Search */}
          <div className="search-container">
            <form
              className="search-box"
              onSubmit={e => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/search?name=${encodeURIComponent(searchQuery)}`);
                }
              }}
            >
              <input
                type="text"
                placeholder="Cari produk atau toko..."
                className="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-icon-button" tabIndex={-1}>
                <svg className="search-icon icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
              </button>
            </form>
          </div>

          {/* Kanan: Icon */}
          <div className="nav-right">
            <div className="desktop-icons">
              <button className="icon-button" onClick={() => navigate('/wishlist')}>
                <HeartIcon className="icon" />
              </button>
              <button className="icon-button" onClick={() => navigate('/cart')}>
                <ShoppingCartIcon className="icon" />
              </button>
              <button className="icon-button" onClick={() => navigate('/chat')}>
                <ChatBubbleLeftRightIcon className="icon" />
              </button>
              <button className="icon-button" onClick={() => navigate('/profile')}>
                {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="object-cover w-10 h-10 rounded-full ring-1 ring-black/50" />
                ) : (
                    <UserIcon className="icon" />
                )}
              </button>
            </div>
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <XMarkIcon className="icon" /> : <Bars3Icon className="icon" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {/* Search Bar */}
            <form
              className="mobile-search-box"
              onSubmit={e => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/search?name=${encodeURIComponent(searchQuery)}`);
                  setIsMenuOpen(false);
                }
              }}
            >
              <input
                type="text"
                placeholder="Cari produk atau toko..."
                className="mobile-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-icon-button" tabIndex={-1}>
                <svg className="search-icon icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
              </button>
            </form>
            {/* Menu Items */}
            <div className="mobile-menu-items">
              <a href="#" className="mobile-menu-item">Beranda</a>
              <a href="#" className="mobile-menu-item">Kontak</a>
              <a href="#" className="mobile-menu-item">Tentang</a>
            </div>
            {/* Icons */}
            <div className="mobile-icons-grid">
              <button className="mobile-icon-button" onClick={() => {navigate('/wishlist'); setIsMenuOpen(false);}}>
                <div className="icon-container">
                  <HeartIcon className="icon" />
                </div>
                <span className="icon-label">Wishlist</span>
              </button>
              <button className="mobile-icon-button" onClick={() => {navigate('/orders'); setIsMenuOpen(false);}}>
                <div className="icon-container">
                  <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5zM12 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5zm3.75 0a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5z" />
                  </svg>
                </div>
                <span className="icon-label">Orders</span>
              </button>
              <button className="mobile-icon-button" onClick={() => {navigate('/cart'); setIsMenuOpen(false);}}>
                <div className="icon-container">
                  <ShoppingCartIcon className="icon" />
                </div>
                <span className="icon-label">Keranjang</span>
              </button>
              <button className="mobile-icon-button" onClick={() => {navigate('/chat'); setIsMenuOpen(false);}}>
                <ChatBubbleLeftRightIcon className="icon" />
                <span className="icon-label">Chat</span>
              </button>
              <button className="mobile-icon-button" onClick={() => {navigate('/profile'); setIsMenuOpen(false);}}>
                <UserIcon className="icon" />
                <span className="icon-label">Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
