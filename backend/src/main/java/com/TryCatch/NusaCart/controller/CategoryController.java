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

import com.TryCatch.NusaCart.dto.CategoryCreateDTO;
import com.TryCatch.NusaCart.dto.CategoryDTO;
import com.TryCatch.NusaCart.dto.CategoryUpdateDTO;
import com.TryCatch.NusaCart.service.CategoryService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/categories")
@Slf4j
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    
    // Get all categories with pagination
    @GetMapping
    public ResponseEntity<?> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET request to fetch categories with pagination - page: {}, size: {}", page, size);
        
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
        
        Map<String, Object> response = categoryService.getPaginatedCategories(page, size);
        return ResponseEntity.ok(response);
    }
    
    // Get category by ID
    @GetMapping("/{idCategory}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Integer idCategory) {
        log.info("GET request to fetch category with ID: {}", idCategory);
        CategoryDTO category = categoryService.getCategoryById(idCategory);
        return ResponseEntity.ok(category);
    }
    
    // Get categories by toko ID with pagination
    @GetMapping("/toko/{idToko}")
    public ResponseEntity<?> getCategoriesByTokoId(
            @PathVariable Integer idToko,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET request to fetch categories for toko with ID: {} (paginated)", idToko);
        
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
        
        Map<String, Object> response = categoryService.getPaginatedCategoriesByTokoId(idToko, page, size);
        return ResponseEntity.ok(response);
    }
    
    // Search categories by name
    @GetMapping("/search")
    public ResponseEntity<List<CategoryDTO>> searchCategories(
            @RequestParam String name,
            @RequestParam(required = false) Integer idToko) {
        log.info("GET request to search categories with name: {}", name);
        
        List<CategoryDTO> categories;
        if (idToko != null) {
            log.info("Searching in specific toko with ID: {}", idToko);
            categories = categoryService.searchCategoriesByNameAndTokoId(name, idToko);
        } else {
            categories = categoryService.searchCategoriesByName(name);
        }
        
        return ResponseEntity.ok(categories);
    }
    
    // Create a new category
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryCreateDTO categoryCreateDTO) {
        log.info("POST request to create a new category");
        CategoryDTO createdCategory = categoryService.createCategory(categoryCreateDTO);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }
    
    // Update a category
    @PutMapping("/{idCategory}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Integer idCategory,
            @Valid @RequestBody CategoryUpdateDTO categoryUpdateDTO) {
        log.info("PUT request to update category with ID: {}", idCategory);
        CategoryDTO updatedCategory = categoryService.updateCategory(idCategory, categoryUpdateDTO);
        return ResponseEntity.ok(updatedCategory);
    }
    
    // Delete a category
    @DeleteMapping("/{idCategory}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Integer idCategory) {
        log.info("DELETE request to delete category with ID: {}", idCategory);
        Map<String, String> response = categoryService.deleteCategory(idCategory);
        return ResponseEntity.ok(response);
    }
}
