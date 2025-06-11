package com.TryCatch.NusaCart.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.TryCatch.NusaCart.service.ProductService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/products")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;
    
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    // Get all products with pagination
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET request to fetch products with pagination - page: {}, size: {}", page, size);
        
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
        
        Map<String, Object> response = productService.getPaginatedProducts(page, size);
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
    
    // Create new product
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductCreateDTO productCreateDTO) {
        log.info("POST request to create new product: {}", productCreateDTO.getProductName());
        
        try {
            ProductDTO createdProduct = productService.createProduct(productCreateDTO);
            return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error creating product: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    // Update product
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateDTO productUpdateDTO) {
        log.info("PUT request to update product with ID: {}", productId);
        
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