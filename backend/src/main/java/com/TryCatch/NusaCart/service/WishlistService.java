package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.ProductResponseDTO;
import com.TryCatch.NusaCart.dto.WishlistDTO;
import com.TryCatch.NusaCart.dto.WishlistResponseDTO;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.entity.WishlistEntity;
import com.TryCatch.NusaCart.repository.ProductRepository;
import com.TryCatch.NusaCart.repository.UserRepository;
import com.TryCatch.NusaCart.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (UserEntity) auth.getPrincipal();
    }

    private WishlistDTO convertToDTO(WishlistEntity entity) {
        WishlistDTO dto = new WishlistDTO();
        dto.setWishlistId(entity.getWishlistId());
        dto.setUserId(entity.getUserId());
        dto.setProducts(entity.getProducts());
        return dto;
    }

    private WishlistResponseDTO convertToResponseDTO(WishlistEntity entity) {
        List<ProductResponseDTO> productDTOs = entity.getProducts().stream().map(product -> {
            ProductResponseDTO.ProductResponseDTOBuilder builder = ProductResponseDTO.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrls(product.getImageUrls())
                .generalCategory(product.getGeneralCategory())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt());
            
            // Handle toko
            if (product.getToko() != null) {
                builder.idToko(product.getToko().getIdToko())
                       .namaToko(product.getToko().getNamaToko());
            }
            
            // Handle category
            if (product.getCategory() != null) {
                builder.idCategory(product.getCategory().getIdCategory())
                       .categoryName(product.getCategory().getNamaCategory());
            }
            
            return builder.build();
        }).toList();

        return WishlistResponseDTO.builder()
                .wishlistId(entity.getWishlistId())
                .userId(entity.getUserId().getUserId())
                .products(productDTOs)
                .build();
    }

    private WishlistEntity convertToEntity(WishlistDTO dto) {
        WishlistEntity entity = new WishlistEntity();
        entity.setWishlistId(dto.getWishlistId());
        UserEntity user = getCurrentUser();
        entity.setUserId(user);
        entity.setProducts(dto.getProducts());
        return entity;
    }

    public WishlistResponseDTO getCurrentUserWishlist() {
        UserEntity currentUser = getCurrentUser();
        return getOrCreateWishlistByUserId(currentUser);
    }

    public List<WishlistResponseDTO> getAllWishlists() {
        return wishlistRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public WishlistDTO createWishlist() {
        WishlistEntity wishlist = new WishlistEntity();
        UserEntity user = getCurrentUser();
        wishlist.setUserId(user);
        wishlist.setProducts(new ArrayList<>());
        wishlist = wishlistRepository.save(wishlist);
        return convertToDTO(wishlist);
    }

    public WishlistResponseDTO getWishlistByUserId(Integer userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));;
        WishlistEntity wishlist = wishlistRepository.findByUserId(user)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        return convertToResponseDTO(wishlist);
    }

    public void deleteWishlist(Integer id) {
         WishlistEntity wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        wishlist.getProducts().clear();
        wishlistRepository.deleteById(id);
    }

    public WishlistResponseDTO addProductToWishlist(Integer wishlistId, Integer productId) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        wishlist.addToWishlist(product);
        return convertToResponseDTO(wishlistRepository.save(wishlist));
    }

    public WishlistResponseDTO removeProductFromWishlist(Integer wishlistId, Integer productId) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        ProductEntity product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        wishlist.removeFromWishlist(product);
        return convertToResponseDTO(wishlistRepository.save(wishlist));
    }

    public WishlistResponseDTO addProductToCurrentUserWishlist(Integer productId) {
        UserEntity currentUser = getCurrentUser();
        WishlistEntity wishlist = wishlistRepository.findByUserId(currentUser)
                .orElse(null);
        
        // Jika wishlist belum ada, buat baru
        if (wishlist == null) {
            wishlist = new WishlistEntity();
            wishlist.setUserId(currentUser);
            wishlist.setProducts(new ArrayList<>());
            wishlist = wishlistRepository.save(wishlist);
        }
        
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produk dengan ID " + productId + " tidak ditemukan"));

        // Cek apakah produk sudah ada di wishlist
        if (wishlist.getProducts().contains(product)) {
            throw new RuntimeException("Produk sudah ada di wishlist");
        }

        wishlist.addToWishlist(product);
        return convertToResponseDTO(wishlistRepository.save(wishlist));
    }

    public WishlistResponseDTO removeProductFromCurrentUserWishlist(Integer productId) {
        UserEntity currentUser = getCurrentUser();
        WishlistEntity wishlist = wishlistRepository.findByUserId(currentUser)
                .orElseThrow(() -> new RuntimeException("Wishlist tidak ditemukan untuk user saat ini"));
        
        ProductEntity product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Produk dengan ID " + productId + " tidak ditemukan"));

        // Cek apakah produk ada di wishlist
        if (!wishlist.getProducts().contains(product)) {
            throw new RuntimeException("Produk tidak ada di wishlist");
        }

        wishlist.removeFromWishlist(product);
        return convertToResponseDTO(wishlistRepository.save(wishlist));
    }
}


