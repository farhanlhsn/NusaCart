package com.TryCatch.NusaCart.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.TryCatch.NusaCart.service.ImageUploadService;
import com.TryCatch.NusaCart.service.UserService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/images")
@Slf4j
public class ImageUploadController {

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private UserService userService;

    /**
     * Upload gambar profil pengguna
     */
    @PostMapping("/upload/profile")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @Valid @RequestParam("file") MultipartFile file,
            @RequestParam(value = "oldImageUrl", required = false) String oldImageUrl) {
        
        log.info("Uploading profile image");
        
        try {
            // Upload dan kompresi gambar
            Map<String, String> uploadResponse = imageUploadService.uploadAndCompressImage(
                file, 
                ImageUploadService.ImageType.PROFILE, 
                oldImageUrl
            );
            
            // Jika upload berhasil, update URL di database
            if ("success".equals(uploadResponse.get("status"))) {
                String imageUrl = uploadResponse.get("imageUrl");
                Map<String, String> updateResponse = userService.updateProfileImage(imageUrl);
                
                // Gabungkan response upload dan update
                uploadResponse.putAll(updateResponse);
                log.info("Profile image uploaded and database updated successfully");
            }
            
            HttpStatus status = "success".equals(uploadResponse.get("status")) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return new ResponseEntity<>(uploadResponse, status);
            
        } catch (Exception e) {
            log.error("Error uploading profile image: {}", e.getMessage());
            return new ResponseEntity<>(
                Map.of("status", "error", "message", "Gagal mengupload gambar profil: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Upload gambar produk
     */
    @PostMapping("/upload/product")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @Valid @RequestParam("file") MultipartFile file,
            @RequestParam(value = "oldImageUrl", required = false) String oldImageUrl) {
        
        log.info("Uploading product image");
        
        Map<String, String> response = imageUploadService.uploadAndCompressImage(
            file, 
            ImageUploadService.ImageType.PRODUCT, 
            oldImageUrl
        );
        
        HttpStatus status = "success".equals(response.get("status")) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return new ResponseEntity<>(response, status);
    }

    /**
     * Upload gambar toko
     */
    @PostMapping("/upload/store")
    public ResponseEntity<Map<String, String>> uploadStoreImage(
            @Valid @RequestParam("file") MultipartFile file,
            @RequestParam(value = "oldImageUrl", required = false) String oldImageUrl) {
        
        log.info("Uploading store image");
        
        Map<String, String> response = imageUploadService.uploadAndCompressImage(
            file, 
            ImageUploadService.ImageType.STORE, 
            oldImageUrl
        );
        
        HttpStatus status = "success".equals(response.get("status")) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return new ResponseEntity<>(response, status);
    }

    /**
     * Upload multiple gambar produk
     */
    @PostMapping("/upload/product/multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleProductImages(
            @Valid @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "oldImageUrls", required = false) List<String> oldImageUrls) {
        
        log.info("Uploading {} product images", files.length);
        
        try {
            // Validasi minimal 1 file
            if (files == null || files.length == 0) {
                return new ResponseEntity<>(
                    Map.of("status", "error", "message", "Minimal harus upload 1 foto produk"), 
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Validasi maksimal 5 file
            if (files.length > 5) {
                return new ResponseEntity<>(
                    Map.of("status", "error", "message", "Maksimal hanya bisa upload 5 foto produk"), 
                    HttpStatus.BAD_REQUEST
                );
            }
            
            List<String> uploadedUrls = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            // Hapus gambar lama jika ada
            if (oldImageUrls != null && !oldImageUrls.isEmpty()) {
                for (String oldUrl : oldImageUrls) {
                    imageUploadService.deleteImage(oldUrl);
                }
            }
            
            // Upload setiap file
            for (MultipartFile file : files) {
                Map<String, String> uploadResult = imageUploadService.uploadAndCompressImage(
                    file, 
                    ImageUploadService.ImageType.PRODUCT, 
                    null
                );
                
                if ("success".equals(uploadResult.get("status"))) {
                    uploadedUrls.add(uploadResult.get("imageUrl"));
                } else {
                    errors.add(uploadResult.get("message"));
                }
            }
            
            Map<String, Object> response = Map.of(
                "status", errors.isEmpty() ? "success" : "partial_success",
                "message", errors.isEmpty() ? "Semua gambar berhasil diupload" : "Beberapa gambar gagal diupload",
                "imageUrls", uploadedUrls,
                "errors", errors
            );
            
            HttpStatus status = errors.isEmpty() ? HttpStatus.OK : HttpStatus.PARTIAL_CONTENT;
            return new ResponseEntity<>(response, status);
            
        } catch (Exception e) {
            log.error("Error uploading multiple product images: {}", e.getMessage());
            return new ResponseEntity<>(
                Map.of("status", "error", "message", "Gagal mengupload gambar produk: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Upload gambar universal dengan parameter tipe
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @Valid @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam(value = "oldImageUrl", required = false) String oldImageUrl) {
        
        log.info("Uploading {} image", type);
        
        try {
            ImageUploadService.ImageType imageType = ImageUploadService.ImageType.valueOf(type.toUpperCase());
            
            Map<String, String> response = imageUploadService.uploadAndCompressImage(
                file, 
                imageType, 
                oldImageUrl
            );
            
            HttpStatus status = "success".equals(response.get("status")) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return new ResponseEntity<>(response, status);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid image type: {}", type);
            return new ResponseEntity<>(
                Map.of("status", "error", "message", "Tipe gambar tidak valid. Gunakan: PROFILE, PRODUCT, atau STORE"), 
                HttpStatus.BAD_REQUEST
            );
        }
    }
}