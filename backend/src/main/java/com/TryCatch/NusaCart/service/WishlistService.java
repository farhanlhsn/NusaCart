package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.ProductResponseDTO;
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

    // Get wishlist berdasarkan  current user
    public WishlistResponseDTO getCurrentUserWishlist() {
        UserEntity currentUser = getCurrentUser();
        return getWishlistByUserId(currentUser.getUserId());
    }

    // Get/Create Wishlist berdasarkan userId
    public WishlistResponseDTO getWishlistByUserId(Integer userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));;
        WishlistEntity wishlist = wishlistRepository.findByUserId(user)
                .orElse(null);

        // Jika wishlist belum ada, buat baru
        if (wishlist == null){
            wishlist = new WishlistEntity();
            wishlist.setUserId(user);
            wishlist.setProducts(new ArrayList<>());
            wishlist = wishlistRepository.save(wishlist);
        }

        return convertToResponseDTO(wishlist);
    }

    // Tambahkan produk pada wishlist
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

    // Menghapus produk dari wishlist
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


