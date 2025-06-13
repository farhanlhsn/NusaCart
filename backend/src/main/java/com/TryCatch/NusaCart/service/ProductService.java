package com.TryCatch.NusaCart.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.ProductCreateDTO;
import com.TryCatch.NusaCart.dto.ProductDTO;
import com.TryCatch.NusaCart.dto.ProductUpdateDTO;
import com.TryCatch.NusaCart.entity.CategoryEntity;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.enums.GeneralCategory;
import com.TryCatch.NusaCart.repository.CategoryRepository;
import com.TryCatch.NusaCart.repository.ProductRepository;
import com.TryCatch.NusaCart.repository.TokoRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private TokoRepository tokoRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ImageUploadService imageUploadService;
    
    public ProductService(ProductRepository productRepository, TokoRepository tokoRepository, 
                         CategoryRepository categoryRepository, UserService userService) {
        this.productRepository = productRepository;
        this.tokoRepository = tokoRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }
    
    // Get all products
    public List<ProductDTO> getAllProducts() {
        log.info("Getting all products");
        return productRepository.findAll()
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get paginated products
    public Map<String, Object> getPaginatedProducts(int page, int size) {
        log.info("Getting paginated products with page: {} and size: {}", page, size);
        
        // Get all products
        List<ProductEntity> allProducts = productRepository.findAll();
        
        // Calculate total count
        long totalCount = allProducts.size();
        
        // Apply pagination manually
        List<ProductDTO> paginatedProducts = allProducts.stream()
                .skip(page * size)
                .limit(size)
                .map(ProductDTO::new)
                .collect(Collectors.toList());
        
        // Calculate total pages
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedProducts);
        response.put("currentPage", page);
        response.put("totalItems", totalCount);
        response.put("totalPages", totalPages);
        response.put("size", size);
        
        return response;
    }
    
    // Get paginated products with filters using database-level filtering
    public Map<String, Object> getPaginatedProductsWithFilters(int page, int size, Integer categoryId, Integer tokoId, 
            Double minPrice, Double maxPrice, Integer minStock, String productName, String sortBy, String sortDirection, Boolean activeOnly) {
        
        log.info("Getting paginated products with filters - page: {}, size: {}, categoryId: {}, tokoId: {}, minPrice: {}, maxPrice: {}, minStock: {}, productName: {}, sortBy: {}, sortDirection: {}, activeOnly: {}", 
                page, size, categoryId, tokoId, minPrice, maxPrice, minStock, productName, sortBy, sortDirection, activeOnly);
        
        // Create Pageable with sorting
        Pageable pageable = createPageableWithSort(page, size, sortBy, sortDirection);
        
        // Get filtered products from database
        Page<ProductEntity> productPage = productRepository.findProductsWithFilters(
                categoryId, tokoId, minPrice, maxPrice, minStock, productName, activeOnly, pageable);
        
        // Convert to DTOs
        List<ProductDTO> productDTOs = productPage.getContent().stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", productDTOs);
        response.put("currentPage", page);
        response.put("totalItems", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("size", size);
        // Create filters map that can handle null values
        Map<String, Object> filters = new HashMap<>();
        filters.put("categoryId", categoryId);
        filters.put("tokoId", tokoId);
        filters.put("minPrice", minPrice);
        filters.put("maxPrice", maxPrice);
        filters.put("minStock", minStock);
        filters.put("productName", productName);
        filters.put("sortBy", sortBy);
        filters.put("sortDirection", sortDirection);
        filters.put("activeOnly", activeOnly);
        response.put("filters", filters);
        
        return response;
    }
    
    // Helper method to create Pageable with sorting
    private Pageable createPageableWithSort(int page, int size, String sortBy, String sortDirection) {
        Sort sort;
        
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            Sort.Direction direction = (sortDirection != null && sortDirection.equalsIgnoreCase("desc")) 
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            
            switch (sortBy.toLowerCase()) {
                case "price":
                    sort = Sort.by(direction, "price");
                    break;
                case "name":
                    sort = Sort.by(direction, "productName");
                    break;
                case "stock":
                    sort = Sort.by(direction, "stock");
                    break;
                case "created":
                case "createdat":
                    sort = Sort.by(direction, "createdAt");
                    break;
                default:
                    // Default sort by creation date (newest first)
                    sort = Sort.by(Sort.Direction.DESC, "createdAt");
                    break;
            }
        } else {
            // Default sort by creation date (newest first)
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }
        
        return PageRequest.of(page, size, sort);
    }
    
    // Get product by ID
    public ProductDTO getProductById(Integer productId) {
        log.info("Getting product with ID: {}", productId);
        ProductEntity product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produk tidak ditemukan dengan ID: " + productId));
        return new ProductDTO(product);
    }
    
    // Get products by toko ID
    public List<ProductDTO> getProductsByTokoId(Integer idToko) {
        log.info("Getting products for toko with ID: {}", idToko);
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        return productRepository.findByToko(toko)
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get paginated products by toko ID
    public Map<String, Object> getPaginatedProductsByTokoId(Integer idToko, int page, int size) {
        log.info("Getting paginated products for toko with ID: {} (page: {}, size: {})", idToko, page, size);
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(idToko)
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + idToko));
        
        // Get all products for this toko
        List<ProductEntity> allProducts = productRepository.findByToko(toko);
        
        // Calculate total count
        long totalCount = allProducts.size();
        
        // Apply pagination manually
        List<ProductDTO> paginatedProducts = allProducts.stream()
                .skip(page * size)
                .limit(size)
                .map(ProductDTO::new)
                .collect(Collectors.toList());
        
        // Calculate total pages
        int totalPages = (int) Math.ceil((double) totalCount / size);
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", paginatedProducts);
        response.put("currentPage", page);
        response.put("totalItems", totalCount);
        response.put("totalPages", totalPages);
        response.put("size", size);
        
        return response;
    }
    
    // Get products by category ID
    public List<ProductDTO> getProductsByCategoryId(Integer idCategory) {
        log.info("Getting products for category with ID: {}", idCategory);
        
        // Check if category exists
        CategoryEntity category = categoryRepository.findByIdCategory(idCategory)
                .orElseThrow(() -> new EntityNotFoundException("Kategori tidak ditemukan dengan ID: " + idCategory));
        
        return productRepository.findByCategory(category)
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }
    
    // Search products by name
    public List<ProductDTO> searchProductsByName(String productName) {
        log.info("Searching products with name containing: {}", productName);
        return productRepository.findByProductNameContainingIgnoreCase(productName)
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get active products
    public List<ProductDTO> getActiveProducts() {
        log.info("Getting all active products");
        return productRepository.findByIsActiveTrue()
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }
    
    // Get products by seller user ID
    public List<ProductDTO> getProductsBySellerUserId(Integer sellerId) {
        log.info("Getting products for seller with user ID: {}", sellerId);
        return productRepository.findBySellerUserId(sellerId)
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }
    
    // Create new product
    @Transactional
    public ProductDTO createProduct(ProductCreateDTO productCreateDTO) {
        log.info("Creating new product: {}", productCreateDTO.getProductName());
        
        // Get current user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Check if toko exists
        TokoEntity toko = tokoRepository.findByIdToko(productCreateDTO.getIdToko())
                .orElseThrow(() -> new EntityNotFoundException("Toko tidak ditemukan dengan ID: " + productCreateDTO.getIdToko()));
        
        // Check if current user is the owner of the toko
        if (!toko.getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Anda tidak memiliki akses untuk menambah produk di toko ini");
        }
        
        // Check if product name already exists in this toko
        if (productRepository.existsByProductNameAndToko(productCreateDTO.getProductName(), toko)) {
            throw new RuntimeException("Produk dengan nama tersebut sudah ada di toko ini");
        }
        
        // Get category if provided
        CategoryEntity category = null;
        if (productCreateDTO.getIdCategory() != null) {
            category = categoryRepository.findByIdCategory(productCreateDTO.getIdCategory())
                    .orElseThrow(() -> new EntityNotFoundException("Kategori tidak ditemukan dengan ID: " + productCreateDTO.getIdCategory()));
        }
        
        // Create product entity
        ProductEntity product = ProductEntity.builder()
                .productName(productCreateDTO.getProductName())
                .description(productCreateDTO.getDescription())
                .price(productCreateDTO.getPrice())
                .stock(productCreateDTO.getStock())
                .toko(toko)
                .imageUrls(productCreateDTO.getImageUrls())
                .category(category)
                .generalCategory(productCreateDTO.getGeneralCategory())
                .isActive(productCreateDTO.getIsActive())
                .build();
        
        ProductEntity savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getProductId());
        
        return new ProductDTO(savedProduct);
    }
    
    // Update product
    @Transactional
    public ProductDTO updateProduct(Integer productId, ProductUpdateDTO productUpdateDTO) {
        log.info("Updating product with ID: {}", productId);
        
        // Get current user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Find existing product
        ProductEntity existingProduct = productRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produk tidak ditemukan dengan ID: " + productId));
        
        // Check if current user is the owner of the toko
        if (!existingProduct.getToko().getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Anda tidak memiliki akses untuk mengubah produk ini");
        }
        
        // Update fields if provided
        if (productUpdateDTO.getProductName() != null) {
            // Check if new product name already exists in this toko (excluding current product)
            if (!existingProduct.getProductName().equals(productUpdateDTO.getProductName()) &&
                productRepository.existsByProductNameAndToko(productUpdateDTO.getProductName(), existingProduct.getToko())) {
                throw new RuntimeException("Produk dengan nama tersebut sudah ada di toko ini");
            }
            existingProduct.setProductName(productUpdateDTO.getProductName());
        }
        
        if (productUpdateDTO.getDescription() != null) {
            existingProduct.setDescription(productUpdateDTO.getDescription());
        }
        
        if (productUpdateDTO.getPrice() != null) {
            existingProduct.setPrice(productUpdateDTO.getPrice());
        }
        
        if (productUpdateDTO.getStock() != null) {
            existingProduct.setStock(productUpdateDTO.getStock());
        }
        

        
        if (productUpdateDTO.getImageUrls() != null) {
            existingProduct.setImageUrls(productUpdateDTO.getImageUrls());
        }
        
        if (productUpdateDTO.getIdCategory() != null) {
            CategoryEntity category = categoryRepository.findByIdCategory(productUpdateDTO.getIdCategory())
                    .orElseThrow(() -> new EntityNotFoundException("Kategori tidak ditemukan dengan ID: " + productUpdateDTO.getIdCategory()));
            existingProduct.setCategory(category);
        }
        
        if (productUpdateDTO.getGeneralCategory() != null) {
            existingProduct.setGeneralCategory(productUpdateDTO.getGeneralCategory());
        }
        
        if (productUpdateDTO.getIsActive() != null) {
            existingProduct.setIsActive(productUpdateDTO.getIsActive());
        }
        
        ProductEntity updatedProduct = productRepository.save(existingProduct);
        log.info("Product updated successfully with ID: {}", updatedProduct.getProductId());
        
        return new ProductDTO(updatedProduct);
    }
    
    // Delete product
    @Transactional
    public Map<String, String> deleteProduct(Integer productId) {
        log.info("Deleting product with ID: {}", productId);
        
        // Get current user
        UserEntity currentUser = userService.getCurrentUser();
        
        // Find existing product
        ProductEntity existingProduct = productRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Produk tidak ditemukan dengan ID: " + productId));
        
        // Check if current user is the owner of the toko
        if (!existingProduct.getToko().getSeller().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("Anda tidak memiliki akses untuk menghapus produk ini");
        }
        
        // Delete images from imageUrls list
        if (existingProduct.getImageUrls() != null) {
            for (String imageUrl : existingProduct.getImageUrls()) {
                imageUploadService.deleteImage(imageUrl);
            }
        }
        
        productRepository.delete(existingProduct);
        log.info("Product deleted successfully with ID: {}", productId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Produk berhasil dihapus");
        response.put("status", "success");
        return response;
    }
}