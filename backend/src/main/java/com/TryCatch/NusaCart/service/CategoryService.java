package com.TryCatch.NusaCart.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.CategoryCreateDTO;
import com.TryCatch.NusaCart.dto.CategoryDTO;
import com.TryCatch.NusaCart.dto.CategoryUpdateDTO;
import com.TryCatch.NusaCart.entity.CategoryEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.CategoryRepository;
import com.TryCatch.NusaCart.repository.TokoRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private TokoRepository tokoRepository;
    
    @Autowired
    private UserService userService;
    
    public CategoryService(CategoryRepository categoryRepository, TokoRepository tokoRepository, UserService userService) {
        this.categoryRepository = categoryRepository;
        this.tokoRepository = tokoRepository;
        this.userService = userService;
    }
    
    // Get all categories
    public List<CategoryDTO> getAllCategories() {
        log.info("Getting all categories");
        return categoryRepository.findAll()
                .stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get paginated categories
    public Map<String, Object> getPaginatedCategories(int page, int size) {
        log.info("Getting paginated categories with page: {} and size: {}", page, size);
        
        // Get all categories
        List<CategoryEntity> allCategories = categoryRepository.findAll();
        
        // Calculate total count
        long totalCount = allCategories.size();
        
        // Apply pagination manually
        List<CategoryDTO> paginatedCategories = allCategories.stream()
                .skip(page * size)
                .limit(size)
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
        
        // Calculate total pages
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedCategories);
        response.put("currentPage", page);
        response.put("totalItems", totalCount);
        response.put("totalPages", totalPages);
        response.put("size", size);
        
        return response;
    }
    
    // Get category by ID
    public CategoryDTO getCategoryById(Integer idCategory) {
        log.info("Getting category with ID: {}", idCategory);
        CategoryEntity category = categoryRepository.findByIdCategory(idCategory)
                .orElseThrow(() -> new EntityNotFoundException("Kategori tidak ditemukan dengan ID: " + idCategory));
        return new CategoryDTO(category);
    }
    
    // Get categories by toko ID
    public List<CategoryDTO> getCategoriesByTokoId(Integer idToko) {
        log.info("Getting categories for toko with ID: {}", idToko);
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        return categoryRepository.findByToko(toko)
                .stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get paginated categories by toko ID
    public Map<String, Object> getPaginatedCategoriesByTokoId(Integer idToko, int page, int size) {
        log.info("Getting paginated categories for toko with ID: {} (page: {}, size: {})", idToko, page, size);
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        // Get all categories for this toko
        List<CategoryEntity> allCategories = categoryRepository.findByToko(toko);
        
        // Calculate total count
        long totalCount = allCategories.size();
        
        // Apply pagination manually
        List<CategoryDTO> paginatedCategories = allCategories.stream()
                .skip(page * size)
                .limit(size)
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
        
        // Calculate total pages
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedCategories);
        response.put("currentPage", page);
        response.put("totalItems", totalCount);
        response.put("totalPages", totalPages);
        response.put("size", size);
        response.put("idToko", idToko);
        response.put("namaToko", toko.getNamaToko());
        
        return response;
    }
    
    // Search categories by name
    public List<CategoryDTO> searchCategoriesByName(String namaCategory) {
        log.info("Searching categories with name containing: {}", namaCategory);
        return categoryRepository.findByNamaCategoryContainingIgnoreCase(namaCategory)
                .stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
    
    // Search categories by name in a specific toko
    public List<CategoryDTO> searchCategoriesByNameAndTokoId(String namaCategory, Integer idToko) {
        log.info("Searching categories with name containing: {} in toko with ID: {}", namaCategory, idToko);
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        return categoryRepository.findByNamaCategoryContainingIgnoreCaseAndToko(namaCategory, toko)
                .stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
    
    // Create a new category
    @Transactional
    public CategoryDTO createCategory(CategoryCreateDTO categoryCreateDTO) {
        log.info("Creating new category: {} for toko ID: {}", categoryCreateDTO.getNamaCategory(), categoryCreateDTO.getIdToko());
        
        // Get current authenticated user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(categoryCreateDTO.getIdToko())
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + categoryCreateDTO.getIdToko()));
        
        // Check if current user is the owner of the store
        if (!toko.getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Tidak dapat membuat kategori untuk toko milik orang lain");
        }
        
        // Check if category name already exists in this toko
        if (categoryRepository.existsByNamaCategoryAndToko(categoryCreateDTO.getNamaCategory(), toko)) {
            throw new IllegalArgumentException("Kategori dengan nama '" + categoryCreateDTO.getNamaCategory() + "' sudah ada di toko ini");
        }
        
        // Create new category entity
        CategoryEntity category = new CategoryEntity();
        category.setNamaCategory(categoryCreateDTO.getNamaCategory());
        category.setToko(toko);
        
        // Save and return
        CategoryEntity savedCategory = categoryRepository.save(category);
        log.info("Category created with ID: {}", savedCategory.getIdCategory());
        
        return new CategoryDTO(savedCategory);
    }
    
    // Update a category
    @Transactional
    public Map<String, Object> updateCategory(Integer idCategory, CategoryUpdateDTO categoryUpdateDTO) {
        log.info("Updating category with ID: {}", idCategory);
        
        // Get current authenticated user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Check if category exists
        CategoryEntity category = categoryRepository.findByIdCategory(idCategory)
                .orElseThrow(() -> new EntityNotFoundException("Kategori tidak ditemukan dengan ID: " + idCategory));
        
        // Check if current user is the owner of the toko associated with this category
        if (!category.getToko().getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Tidak dapat mengupdate kategori untuk toko milik orang lain");
        }
        
        // Check if new category name already exists in this toko (if name is being changed)
        if (!category.getNamaCategory().equals(categoryUpdateDTO.getNamaCategory()) &&
            categoryRepository.existsByNamaCategoryAndToko(categoryUpdateDTO.getNamaCategory(), category.getToko())) {
            throw new IllegalArgumentException("Kategori dengan nama '" + categoryUpdateDTO.getNamaCategory() + "' sudah ada di toko ini");
        }
        
        category.setNamaCategory(categoryUpdateDTO.getNamaCategory());
        
        CategoryEntity updatedCategory = categoryRepository.save(category);
        log.info("Category updated: {}", updatedCategory.getIdCategory());
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Kategori berhasil diperbarui");
        response.put("data", new CategoryDTO(updatedCategory));
        return response;
    }
    
    // Delete a category
    @Transactional
    public Map<String, String> deleteCategory(Integer idCategory) {
        log.info("Deleting category with ID: {}", idCategory);
        
        // Get current authenticated user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Check if category exists
        CategoryEntity category = categoryRepository.findByIdCategory(idCategory)
                .orElseThrow(() -> new EntityNotFoundException("Kategori tidak ditemukan dengan ID: " + idCategory));
        
        // Check if current user is the owner of the toko associated with this category
        if (!category.getToko().getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Tidak dapat menghapus kategori untuk toko milik orang lain");
        }
        
        // Delete the category
        categoryRepository.delete(category);
        log.info("Category deleted: {}", idCategory);
        
        // Return success response
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Kategori berhasil dihapus");
        return response;
    }
    
    // Get categories for current seller's stores
    public List<CategoryDTO> getCategoriesForCurrentSeller() {
        log.info("Getting categories for current seller's stores");
        
        // Get current authenticated user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Get all stores owned by the current seller
        List<TokoEntity> sellerStores = tokoRepository.findBySeller(currentUser);
        
        if (sellerStores.isEmpty()) {
            log.info("Current seller has no stores");
            return List.of();
        }
        
        // Collect all categories from all stores owned by the seller
        return sellerStores.stream()
                .flatMap(store -> categoryRepository.findByToko(store).stream())
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get paginated categories for current seller's stores
    public Map<String, Object> getPaginatedCategoriesForCurrentSeller(int page, int size) {
        log.info("Getting paginated categories for current seller's stores with page: {} and size: {}", page, size);
        
        // Get current authenticated user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Get all stores owned by the current seller
        List<TokoEntity> sellerStores = tokoRepository.findBySeller(currentUser);
        
        if (sellerStores.isEmpty()) {
            log.info("Current seller has no stores");
            Map<String, Object> emptyResponse = new HashMap<>();
            emptyResponse.put("content", List.of());
            emptyResponse.put("currentPage", page);
            emptyResponse.put("totalItems", 0);
            emptyResponse.put("totalPages", 0);
            emptyResponse.put("size", size);
            return emptyResponse;
        }
        
        // Collect all categories from all stores owned by the seller
        List<CategoryEntity> allCategories = sellerStores.stream()
                .flatMap(store -> categoryRepository.findByToko(store).stream())
                .collect(Collectors.toList());
        
        // Calculate total count
        long totalCount = allCategories.size();
        
        // Apply pagination manually
        List<CategoryDTO> paginatedCategories = allCategories.stream()
                .skip(page * size)
                .limit(size)
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
        
        // Calculate total pages
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedCategories);
        response.put("currentPage", page);
        response.put("totalItems", totalCount);
        response.put("totalPages", totalPages);
        response.put("size", size);
        
        return response;
    }
}
