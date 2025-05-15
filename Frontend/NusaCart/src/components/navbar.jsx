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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <a href="#" className="menu-item">Beranda</a>
              <a href="#" className="menu-item">Kontak</a>
              <a href="#" className="menu-item">Tentang</a>
            </div>
          </div>

          {/* Tengah: Search */}
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Apa yang Anda cari?"
                className="search-input"
              />
              <svg className="search-icon icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </div>
          </div>

          {/* Kanan: Icon */}
          <div className="nav-right">
            <div className="desktop-icons">
              <button className="icon-button">
                <HeartIcon className="icon" />
                <span className="notification-badge">0</span>
              </button>
              <button className="icon-button">
                <BellIcon className="icon" />
                <span className="notification-badge">0</span>
              </button>
              <button className="icon-button">
                <ShoppingCartIcon className="icon" />
                <span className="notification-badge">0</span>
              </button>
              <button className="icon-button">
                <ChatBubbleLeftRightIcon className="icon" />
              </button>
              <button className="icon-button">
                <UserIcon className="icon" />
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
            <div className="mobile-search-box">
              <input
                type="text"
                placeholder="Apa yang Anda cari?"
                className="mobile-search-input"
              />
              <svg className="search-icon icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </div>
            {/* Menu Items */}
            <div className="mobile-menu-items">
              <a href="#" className="mobile-menu-item">Beranda</a>
              <a href="#" className="mobile-menu-item">Kontak</a>
              <a href="#" className="mobile-menu-item">Tentang</a>
            </div>
            {/* Icons */}
            <div className="mobile-icons-grid">
              <button className="mobile-icon-button">
                <div className="icon-container">
                  <HeartIcon className="icon" />
                  <span className="notification-badge">0</span>
                </div>
                <span className="icon-label">Wishlist</span>
              </button>
              <button className="mobile-icon-button">
                <div className="icon-container">
                  <BellIcon className="icon" />
                  <span className="notification-badge">0</span>
                </div>
                <span className="icon-label">Notifikasi</span>
              </button>
              <button className="mobile-icon-button">
                <div className="icon-container">
                  <ShoppingCartIcon className="icon" />
                  <span className="notification-badge">0</span>
                </div>
                <span className="icon-label">Keranjang</span>
              </button>
              <button className="mobile-icon-button">
                <ChatBubbleLeftRightIcon className="icon" />
                <span className="icon-label">Chat</span>
              </button>
              <button className="mobile-icon-button">
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
