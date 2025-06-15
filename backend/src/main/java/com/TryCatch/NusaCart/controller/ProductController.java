package com.TryCatch.NusaCart.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.ProductCreateDTO;
import com.TryCatch.NusaCart.dto.ProductDTO;
import com.TryCatch.NusaCart.dto.ProductUpdateDTO;
import com.TryCatch.NusaCart.enums.GeneralCategory;
import com.TryCatch.NusaCart.service.ImageUploadService;
import com.TryCatch.NusaCart.service.ProductService;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/products")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private ImageUploadService imageUploadService;
    
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    // Get all products with pagination and optional filters
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer tokoId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) GeneralCategory generalCategory,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam(defaultValue = "true") Boolean activeOnly) {
        
        log.info("GET request to fetch products with pagination and filters - page: {}, size: {}, categoryId: {}, tokoId: {}, minPrice: {}, maxPrice: {}, minStock: {}, productName: {}, generalCategory: {}, sortBy: {}, sortDirection: {}, activeOnly: {}", 
                page, size, categoryId, tokoId, minPrice, maxPrice, minStock, productName, generalCategory, sortBy, sortDirection, activeOnly);
        
        // Validate pagination parameters
        if (page < 0) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Page number cannot be negative"
            ));
        }
        
        if (size <= 0 || size > 100) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Size must be between 1 and 100"
            ));
        }
        
        // Validate price range
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Minimum price cannot be greater than maximum price"
            ));
        }
        
        // Validate sort direction
        if (sortDirection != null && !sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc")) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Sort direction must be 'asc' or 'desc'"
            ));
        }
        
        Map<String, Object> response = productService.getPaginatedProductsWithFilters(
            page, size, categoryId, tokoId, minPrice, maxPrice, minStock, productName, generalCategory, sortBy, sortDirection, activeOnly);
        return ResponseEntity.ok(response);
    }
    
    // Get product by ID
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Integer productId) {
        log.info("GET request to fetch product with ID: {}", productId);
        ProductDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }
    
    // Get products by toko ID with pagination
    @GetMapping("/toko/{idToko}")
    public ResponseEntity<?> getProductsByTokoId(
            @PathVariable Integer idToko,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET request to fetch products for toko with ID: {} (paginated)", idToko);
        
        // Validate pagination parameters
        if (page < 0) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Page number cannot be negative"
            ));
        }
        
        if (size <= 0 || size > 100) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Size must be between 1 and 100"
            ));
        }
        
        Map<String, Object> response = productService.getPaginatedProductsByTokoId(idToko, page, size);
        return ResponseEntity.ok(response);
    }
    
    // Get products by category ID
    @GetMapping("/category/{idCategory}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategoryId(@PathVariable Integer idCategory) {
        log.info("GET request to fetch products for category with ID: {}", idCategory);
        List<ProductDTO> products = productService.getProductsByCategoryId(idCategory);
        return ResponseEntity.ok(products);
    }
    
    // Search products by name
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProductsByName(@RequestParam String name) {
        log.info("GET request to search products with name: {}", name);
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<ProductDTO> products = productService.searchProductsByName(name.trim());
        return ResponseEntity.ok(products);
    }
    
    // Get active products
    @GetMapping("/active")
    public ResponseEntity<List<ProductDTO>> getActiveProducts() {
        log.info("GET request to fetch all active products");
        List<ProductDTO> products = productService.getActiveProducts();
        return ResponseEntity.ok(products);
    }
    
    // Get products by seller user ID
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ProductDTO>> getProductsBySellerUserId(@PathVariable Integer sellerId) {
        log.info("GET request to fetch products for seller with user ID: {}", sellerId);
        List<ProductDTO> products = productService.getProductsBySellerUserId(sellerId);
        return ResponseEntity.ok(products);
    }
    
    // Create new product with images
    @PostMapping
    public ResponseEntity<?> createProduct(
            @Valid @RequestParam("productData") String productDataJson,
            @RequestParam("images") MultipartFile[] images) {
        
        log.info("POST request to create new product with {} images", images.length);
        
        try {
            // Validasi minimal 1 foto
            if (images == null || images.length == 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Produk harus memiliki minimal 1 foto"
                ));
            }
            
            // Parse JSON data
            ObjectMapper objectMapper = new ObjectMapper();
            ProductCreateDTO productCreateDTO = objectMapper.readValue(productDataJson, ProductCreateDTO.class);
            
            // Upload images first
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                Map<String, String> uploadResult = imageUploadService.uploadAndCompressImage(
                    image, 
                    ImageUploadService.ImageType.PRODUCT, 
                    null
                );
                
                if ("success".equals(uploadResult.get("status"))) {
                    imageUrls.add(uploadResult.get("imageUrl"));
                } else {
                    // If any image fails, delete already uploaded images
                    for (String uploadedUrl : imageUrls) {
                        imageUploadService.deleteImage(uploadedUrl);
                    }
                    return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "Gagal mengupload gambar: " + uploadResult.get("message")
                    ));
                }
            }
            
            // Set image URLs to DTO
            productCreateDTO.setImageUrls(imageUrls);
            
            try {
                // Create product in database
                ProductDTO createdProduct = productService.createProduct(productCreateDTO);
                return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
                
            } catch (Exception e) {
                // If product creation fails, delete all uploaded images (rollback)
                log.warn("Product creation failed, rolling back uploaded images: {}", e.getMessage());
                for (String uploadedUrl : imageUrls) {
                    boolean deleted = imageUploadService.deleteImage(uploadedUrl);
                    if (deleted) {
                        log.info("Successfully deleted image during rollback: {}", uploadedUrl);
                    } else {
                        log.error("Failed to delete image during rollback: {}", uploadedUrl);
                    }
                }
                
                // Re-throw the exception to be handled by outer catch block
                throw e;
            }
            
        } catch (Exception e) {
            log.error("Error creating product: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    // Update product with optional new images
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer productId,
            @RequestParam("productData") String productDataJson,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        
        log.info("PUT request to update product with ID: {}", productId);
        
        try {
            // Parse JSON data
            ObjectMapper objectMapper = new ObjectMapper();
            ProductUpdateDTO productUpdateDTO = objectMapper.readValue(productDataJson, ProductUpdateDTO.class);
            
            // If new images are provided, upload them
            if (images != null && images.length > 0) {
                List<String> newImageUrls = new ArrayList<>();
                
                for (MultipartFile image : images) {
                    Map<String, String> uploadResult = imageUploadService.uploadAndCompressImage(
                        image, 
                        ImageUploadService.ImageType.PRODUCT, 
                        null
                    );
                    
                    if ("success".equals(uploadResult.get("status"))) {
                        newImageUrls.add(uploadResult.get("imageUrl"));
                    } else {
                        // If any image fails, delete already uploaded images
                        for (String uploadedUrl : newImageUrls) {
                            imageUploadService.deleteImage(uploadedUrl);
                        }
                        return ResponseEntity.badRequest().body(Map.of(
                            "status", "error",
                            "message", "Gagal mengupload gambar: " + uploadResult.get("message")
                        ));
                    }
                }
                
                // Combine existing images with new images
                List<String> allImageUrls = new ArrayList<>();
                
                // Add existing images if provided
                if (productUpdateDTO.getExistingImageUrls() != null) {
                    allImageUrls.addAll(productUpdateDTO.getExistingImageUrls());
                }
                
                // Add new images
                allImageUrls.addAll(newImageUrls);
                
                // Set combined image URLs
                productUpdateDTO.setImageUrls(allImageUrls);
                
                try {
                    // Update product in database
                    ProductDTO updatedProduct = productService.updateProduct(productId, productUpdateDTO);
                    return ResponseEntity.ok(updatedProduct);
                    
                } catch (Exception e) {
                    // If product update fails, delete newly uploaded images (rollback)
                    log.warn("Product update failed, rolling back newly uploaded images: {}", e.getMessage());
                    for (String uploadedUrl : newImageUrls) {
                        boolean deleted = imageUploadService.deleteImage(uploadedUrl);
                        if (deleted) {
                            log.info("Successfully deleted image during rollback: {}", uploadedUrl);
                        } else {
                            log.error("Failed to delete image during rollback: {}", uploadedUrl);
                        }
                    }
                    
                    // Re-throw the exception to be handled by outer catch block
                    throw e;
                }
            } else {
                // No new images, just update product data
                ProductDTO updatedProduct = productService.updateProduct(productId, productUpdateDTO);
                return ResponseEntity.ok(updatedProduct);
            }
            
        } catch (Exception e) {
            log.error("Error updating product: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    // Update product (JSON only - for backward compatibility)
    @PutMapping("/{productId}/json")
    public ResponseEntity<?> updateProductJson(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateDTO productUpdateDTO) {
        log.info("PUT request to update product with ID: {} (JSON only)", productId);
        
        try {
            ProductDTO updatedProduct = productService.updateProduct(productId, productUpdateDTO);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            log.error("Error updating product: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    // Delete product
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer productId) {
        log.info("DELETE request to delete product with ID: {}", productId);
        
        try {
            Map<String, String> response = productService.deleteProduct(productId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting product: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}