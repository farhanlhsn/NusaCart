# NusaCart - Platform E-Commerce Indonesia

![NusaCart Logo](Frontend/NusaCart/src/assets/logoFooter.png)

## 📋 Deskripsi Proyek

NusaCart adalah platform e-commerce modern yang dirancang khusus untuk pasar Indonesia. Platform ini menyediakan solusi lengkap untuk jual-beli online dengan fitur-fitur canggih seperti sistem chat real-time, verifikasi OTP melalui WhatsApp, manajemen toko, dan sistem pembayaran yang terintegrasi.

## 🏗️ Arsitektur Sistem

### Backend
- **Framework**: Spring Boot 3.3.10
- **Java Version**: Java 21
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token) dengan Cookie-based session
- **Security**: Spring Security dengan custom JWT filter
- **Documentation**: OpenAPI 3 (Springdoc)
- **Build Tool**: Maven
- **Port**: 6060

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6.3.1
- **Styling**: TailwindCSS 4.1.6
- **State Management**: Zustand 5.0.4
- **HTTP Client**: Axios 1.9.0
- **Routing**: React Router DOM 7.6.0
- **Charts**: Chart.js 4.4.9 dengan React-ChartJS-2
- **Icons**: Lucide React, React Icons, Heroicons
- **Notifications**: React Hot Toast

## ✨ Fitur Utama

### 🔐 Sistem Autentikasi & Keamanan
- **Registrasi dengan OTP WhatsApp**: Verifikasi nomor telepon menggunakan WhatsApp API
- **Login/Logout dengan JWT**: Cookie-based authentication untuk keamanan maksimal
- **Forget Password**: Reset password dengan kode OTP melalui WhatsApp
- **Proactive Token Refresh**: Otomatis refresh token sebelum expired
- **Phone Number Normalization**: Normalisasi nomor telepon Indonesia ke format internasional

### 👥 Manajemen Pengguna
- **Multi-Role System**: USER dan SELLER dengan permission berbeda
- **Profile Management**: Update profil, foto, nomor telepon dengan validasi
- **Address Management**: CRUD alamat pengiriman dengan alamat utama
- **Seller Registration**: Upgrade akun user menjadi seller dengan toko

### 🛍️ E-Commerce Core
- **Product Management**: CRUD produk dengan multiple images dan kategori
- **Category System**: Kategori umum dan kategori toko dengan hierarki
- **Shopping Cart**: Add to cart, update quantity, checkout dengan multiple stores
- **Wishlist**: Save produk favorit untuk pembelian nanti
- **Order Management**: Place order, tracking status, payment integration
- **Search & Filter**: Pencarian produk dengan filter harga, kategori, stok

### 🏪 Fitur Seller
- **Store Management**: Kelola informasi toko, foto, deskripsi
- **Product Analytics**: Dashboard penjualan dengan Chart.js
- **Order Processing**: Kelola pesanan masuk, update status pengiriman
- **Inventory Management**: Kelola stok produk real-time

### 💬 Sistem Komunikasi
- **Real-time Chat**: Chat antara buyer dan seller
- **Chat History**: Riwayat percakapan tersimpan
- **Report System**: Laporkan chat yang tidak pantas
- **WhatsApp Integration**: Notifikasi OTP dan update order via WhatsApp

### 💳 Sistem Pembayaran
- **Multiple Payment Methods**: Berbagai metode pembayaran (Bank Transfer, E-Wallet, dll)
- **Payment Status Tracking**: Real-time update status pembayaran
- **Order Status Management**: Tracking dari order hingga delivered
- **Discount System**: Sistem promo dan diskon dengan kode

### 📱 User Experience
- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Modern UI/UX**: Interface yang clean dan user-friendly
- **Loading States**: Skeleton loading dan progress indicators
- **Error Handling**: Comprehensive error handling dengan user-friendly messages
- **Toast Notifications**: Real-time feedback untuk user actions

## 🚀 Instalasi dan Setup

### Prerequisites
- Java 21 atau lebih tinggi
- Node.js 18 atau lebih tinggi
- MySQL 8.0 atau lebih tinggi
- Maven 3.6 atau lebih tinggi

### Backend Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd NusaCart/backend
   ```

2. **Setup Database**
   ```sql
   CREATE DATABASE nusacart;
   ```

3. **Konfigurasi Database**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.application.name=NusaCart
   spring.datasource.url=jdbc:mysql://localhost:3306/nusacart
   spring.datasource.username=root
   spring.datasource.password=your_password
   
   # Server Configuration
   server.port=6060
   
   # WhatsApp API Configuration
   whatsapp.api.url=your_whatsapp_api_url
   whatsapp.api.username=your_username
   whatsapp.api.password=your_password
   ```

4. **Install Dependencies & Run**
   ```bash
   # Windows
   .\mvnw clean install
   .\mvnw spring-boot:run
   
   # Linux/Mac
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd NusaCart/Frontend/NusaCart
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`

4. **Build untuk Production**
   ```bash
   npm run build
   npm run preview
   ```

## 📁 Struktur Proyek

### Backend Structure
```
backend/
├── src/main/java/com/TryCatch/NusaCart/
│   ├── controller/          # REST API Controllers
│   │   ├── AuthController.java
│   │   ├── ProductController.java
│   │   ├── OrderController.java
│   │   ├── PaymentController.java
│   │   ├── ChatController.java
│   │   └── ...
│   ├── service/            # Business Logic Services
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   ├── ProductService.java
│   │   └── ...
│   ├── entity/             # JPA Entities
│   │   ├── UserEntity.java
│   │   ├── ProductEntity.java
│   │   ├── OrderEntity.java
│   │   └── ...
│   ├── dto/                # Data Transfer Objects
│   ├── repository/         # JPA Repositories
│   ├── security/           # Security Configuration
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── SecurityConfig.java
│   ├── config/             # Application Configuration
│   ├── exception/          # Custom Exceptions
│   ├── enums/              # Enumerations
│   └── utils/              # Utility Classes
├── src/main/resources/
│   ├── application.properties
│   └── static/
└── pom.xml
```

### Frontend Structure
```
Frontend/NusaCart/
├── src/
│   ├── components/         # Reusable Components
│   │   ├── navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── AddressModal.jsx
│   │   ├── EditProfile.jsx
│   │   └── ...
│   ├── pages/              # Page Components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── UserRegisterPage.jsx
│   │   ├── VerifyRegistrationPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── SellerDashboard.jsx
│   │   └── ...
│   ├── stores/             # Zustand State Management
│   │   ├── authStore.js
│   │   ├── cartStore.js
│   │   ├── productStore.js
│   │   ├── chatStore.js
│   │   └── ...
│   ├── services/           # API Services
│   │   └── api.js
│   ├── assets/             # Static Assets
│   │   ├── Logo.png
│   │   └── images/
│   └── App.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🛠️ Teknologi yang Digunakan

### Backend Dependencies
- **Spring Boot Starter Web**: REST API development
- **Spring Boot Starter Data JPA**: Database ORM
- **Spring Boot Starter Security**: Authentication & Authorization
- **Spring Boot Starter Validation**: Input validation
- **MySQL Connector**: Database driver
- **JWT (jjwt)**: Token-based authentication
- **Lombok**: Reduce boilerplate code
- **Springdoc OpenAPI**: API documentation
- **Thumbnailator**: Image processing

### Frontend Dependencies
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool dan dev server
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Axios**: HTTP client dengan interceptors
- **React Router DOM**: Client-side routing
- **Chart.js**: Data visualization
- **Lucide React**: Modern icon library
- **React Hot Toast**: Toast notifications


### Database Schema
Database akan otomatis dibuat menggunakan JPA/Hibernate dengan konfigurasi:
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### WhatsApp API Integration
Untuk menggunakan fitur OTP WhatsApp, konfigurasikan:
1. Daftar WhatsApp Business API
2. Dapatkan credentials (URL, username, password)
3. Update `application.properties`


## 📦 Build & Deployment

### Backend Production Build
```bash
./mvnw clean package -DskipTests
java -jar target/NusaCart-0.0.1-SNAPSHOT.jar
```

### Frontend Production Build
```bash
npm run build
# Files akan tersedia di folder dist/
```

## 🔒 Fitur Keamanan

- **JWT Authentication**: Secure token-based auth dengan refresh mechanism
- **Password Encryption**: BCrypt hashing untuk password
- **CORS Configuration**: Proper CORS setup untuk cross-origin requests
- **Input Validation**: Comprehensive validation di backend dan frontend
- **SQL Injection Prevention**: JPA/Hibernate prepared statements
- **XSS Protection**: Input sanitization dan output encoding
- **Phone Number Validation**: Validasi format nomor telepon Indonesia

## 📱 Responsive Design

- **Mobile First**: Desain prioritas mobile dengan breakpoint responsive
- **Touch Friendly**: Interface yang optimal untuk touch devices
- **Performance Optimized**: Lazy loading dan code splitting
- **PWA Ready**: Service worker dan manifest untuk Progressive Web App

## 👥 Tim Pengembang

**TryCatch Team**
- Full-stack development : Farhan, Zacky
- UI/UX Design : Fikri, Adi, Ali
- Backend : Ali, Adi, Akbar, Fikri

---

**NusaCart** - *Membangun Ekosistem E-Commerce Indonesia yang Modern dan Terpercaya*
