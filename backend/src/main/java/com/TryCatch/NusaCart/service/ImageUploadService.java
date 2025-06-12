package com.TryCatch.NusaCart.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Service
@Slf4j
public class ImageUploadService {

    @Value("${app.upload.dir:./uploads}")
    private String baseUploadDir;

    // Enum untuk tipe upload
    public enum ImageType {
        PROFILE("profiles", 640, 640, 0.85f),
        PRODUCT("products", 800, 800, 0.85f),
        STORE("stores", 640, 640, 0.85f);

        private final String subDirectory;
        private final int maxWidth;
        private final int maxHeight;
        private final float quality;

        ImageType(String subDirectory, int maxWidth, int maxHeight, float quality) {
            this.subDirectory = subDirectory;
            this.maxWidth = maxWidth;
            this.maxHeight = maxHeight;
            this.quality = quality;
        }

        public String getSubDirectory() { return subDirectory; }
        public int getMaxWidth() { return maxWidth; }
        public int getMaxHeight() { return maxHeight; }
        public float getQuality() { return quality; }
    }

    /**
     * Upload dan kompresi gambar secara universal
     * @param imageFile File gambar yang akan diupload
     * @param imageType Tipe gambar (PROFILE, PRODUCT, STORE)
     * @param oldImageUrl URL gambar lama yang akan dihapus (optional)
     * @return Map berisi informasi hasil upload
     */
    public Map<String, String> uploadAndCompressImage(MultipartFile imageFile, ImageType imageType, String oldImageUrl) {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Validasi file
            if (imageFile == null || imageFile.isEmpty()) {
                throw new IllegalArgumentException("File gambar tidak boleh kosong");
            }

            // Validasi tipe file
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("File harus berupa gambar");
            }

            // Validasi ukuran file (maksimal 10MB)
            if (imageFile.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("Ukuran file tidak boleh lebih dari 10MB");
            }

            // Buat direktori upload jika belum ada
            Path uploadPath = Paths.get(baseUploadDir, imageType.getSubDirectory());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath);
            }

            // Hapus file lama jika ada
            if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
                deleteOldImage(oldImageUrl);
            }

            // Generate nama file baru
            String originalFileName = imageFile.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(newFileName);

            // Kompresi dan simpan gambar
            compressAndSaveImage(imageFile, filePath, imageType);

            // Generate URL gambar
            String imageUrl = "/uploads/" + imageType.getSubDirectory() + "/" + newFileName;

            log.info("Image uploaded and compressed successfully: {}", imageUrl);

            response.put("status", "success");
            response.put("message", "Gambar berhasil diupload dan dikompres");
            response.put("imageUrl", imageUrl);
            response.put("fileName", newFileName);

        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }

    /**
     * Kompresi dan simpan gambar menggunakan Thumbnailator
     */
    private void compressAndSaveImage(MultipartFile imageFile, Path filePath, ImageType imageType) throws IOException {
        Thumbnails.of(imageFile.getInputStream())
                .size(imageType.getMaxWidth(), imageType.getMaxHeight())
                .outputQuality(imageType.getQuality())
                .keepAspectRatio(true)
                .toFile(filePath.toFile());
        
        log.info("Image compressed - Original size: {} bytes, Target dimensions: {}x{}, Quality: {}", 
                imageFile.getSize(), imageType.getMaxWidth(), imageType.getMaxHeight(), imageType.getQuality());
    }

    /**
     * Hapus gambar lama
     */
    private void deleteOldImage(String oldImageUrl) {
        try {
            // Extract path dari URL (misal: /uploads/profiles/filename.jpg -> profiles/filename.jpg)
            if (oldImageUrl.startsWith("/uploads/")) {
                String relativePath = oldImageUrl.substring("/uploads/".length());
                Path oldFilePath = Paths.get(baseUploadDir, relativePath);
                
                if (Files.exists(oldFilePath)) {
                    Files.delete(oldFilePath);
                    log.info("Deleted old image: {}", oldFilePath);
                }
            }
        } catch (IOException e) {
            log.warn("Could not delete old image {}: {}", oldImageUrl, e.getMessage());
        }
    }

    /**
     * Dapatkan ekstensi file
     */
    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return ".jpg"; // default extension
    }

    /**
     * Hapus gambar berdasarkan URL
     */
    public boolean deleteImage(String imageUrl) {
        try {
            deleteOldImage(imageUrl);
            return true;
        } catch (Exception e) {
            log.error("Error deleting image {}: {}", imageUrl, e.getMessage());
            return false;
        }
    }
} 