package com.TryCatch.NusaCart.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.TokoDTO;
import com.TryCatch.NusaCart.dto.TokoUpdateDTO;
import com.TryCatch.NusaCart.service.TokoService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/toko")
@Slf4j
public class TokoController {

    @Autowired
    private TokoService tokoService;
    
    public TokoController(TokoService tokoService) {
        this.tokoService = tokoService;
    }
    
    // Get all stores with pagination
    @GetMapping
    public ResponseEntity<?> getAllStores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET request to fetch stores with pagination - page: {}, size: {}", page, size);
        
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
        
        Map<String, Object> response = tokoService.getPaginatedToko(page, size);
        return ResponseEntity.ok(response);
    }
    
    // Get store by ID
    @GetMapping("/{idToko}")
    public ResponseEntity<TokoDTO> getStoreById(@PathVariable Integer idToko) {
        log.info("GET request to fetch store with ID: {}", idToko);
        TokoDTO store = tokoService.getTokoById(idToko);
        return ResponseEntity.ok(store);
    }
    
    // Get stores for current seller
    @GetMapping("/my-stores")
    public ResponseEntity<List<TokoDTO>> getMyStores() {
        log.info("GET request to fetch stores for current seller");
        List<TokoDTO> stores = tokoService.getTokoByCurrentSeller();
        return ResponseEntity.ok(stores);
    }
    
    // Search stores by name with pagination
    @GetMapping("/search")
    public ResponseEntity<?> searchStores(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
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
        
        // If no search term provided, return paginated list of all stores
        if (name == null || name.trim().isEmpty()) {
            log.info("GET request to search stores with no search term, returning all stores with pagination");
            Map<String, Object> response = tokoService.getPaginatedToko(page, size);
            return ResponseEntity.ok(response);
        }
        
        // Return paginated search results
        log.info("GET request to search stores with name: {} (paginated)", name);
        Map<String, Object> response = tokoService.searchTokoByNamePaginated(name, page, size);
        return ResponseEntity.ok(response);
    }
    
    // Update a store
    @PutMapping("/{idToko}")
    public ResponseEntity<TokoDTO> updateStore(
            @PathVariable Integer idToko,
            @Valid @RequestBody TokoUpdateDTO tokoUpdateDTO) {
        log.info("PUT request to update store with ID: {}", idToko);
        TokoDTO updatedStore = tokoService.updateToko(idToko, tokoUpdateDTO);
        return ResponseEntity.ok(updatedStore);
    }
    
    // Delete a store
    @DeleteMapping("/{idToko}")
    public ResponseEntity<Map<String, String>> deleteStore(@PathVariable Integer idToko) {
        log.info("DELETE request to delete store with ID: {}", idToko);
        Map<String, String> response = tokoService.deleteToko(idToko);
        return ResponseEntity.ok(response);
    }
}
