-- SQL script untuk mengupdate kolom is_verified yang bernilai NULL menjadi false (0)
-- Jalankan script ini jika ada data user yang sudah ada sebelum penambahan kolom is_verified

-- Update kolom is_verified yang bernilai NULL menjadi false
UPDATE users 
SET is_verified = false 
WHERE is_verified IS NULL;

-- Alternatif jika menggunakan tipe data TINYINT (0 untuk false, 1 untuk true)
-- UPDATE users 
-- SET is_verified = 0 
-- WHERE is_verified IS NULL;

-- Verifikasi hasil update
SELECT 
    user_id,
    name,
    email,
    is_verified,
    registered_date
FROM users 
ORDER BY registered_date DESC;

-- Optional: Tambahkan constraint NOT NULL setelah update
-- ALTER TABLE users MODIFY COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;