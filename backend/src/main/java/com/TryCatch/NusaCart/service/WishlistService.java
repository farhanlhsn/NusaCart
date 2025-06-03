package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.WishlistDTO;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.WishlistEntity;
import com.TryCatch.NusaCart.repository.ProductRepository;
import com.TryCatch.NusaCart.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    private WishlistDTO convertToDTO(WishlistEntity entity) {
        WishlistDTO dto = new WishlistDTO();
        dto.setWishlistId(entity.getWishlistId());
        dto.setUserId(entity.getUserId());
        dto.setProducts(entity.getProducts());
        return dto;
    }

    private WishlistEntity convertToEntity(WishlistDTO dto) {
        WishlistEntity entity = new WishlistEntity();
        entity.setWishlistId(dto.getWishlistId());
        entity.setUserId(dto.getUserId());
        entity.setProducts(dto.getProducts());
        return entity;
    }

    public List<WishlistDTO> getAllWishlists() {
        return wishlistRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public WishlistDTO getWishlistById(Integer id) {
        WishlistEntity wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        return convertToDTO(wishlist);
    }

    public WishlistDTO createWishlist(WishlistDTO dto) {
        WishlistEntity entity = convertToEntity(dto);
        return convertToDTO(wishlistRepository.save(entity));
    }

    public WishlistDTO updateWishlist(Integer id, WishlistDTO dto) {
        WishlistEntity existing = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        existing.setUserId(dto.getUserId());
        existing.setProducts(dto.getProducts());
        return convertToDTO(wishlistRepository.save(existing));
    }

    public void deleteWishlist(Integer id) {
        wishlistRepository.deleteById(id);
    }

    public WishlistDTO addProductToWishlist(Integer wishlistId, Integer productId) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        wishlist.addToWishlist(product);
        return convertToDTO(wishlistRepository.save(wishlist));
    }

    public WishlistDTO removeProductFromWishlist(Integer wishlistId, Long productId) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));
        ProductEntity product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        wishlist.removeFromWishlist(product);
        return convertToDTO(wishlistRepository.save(wishlist));
    }
}


