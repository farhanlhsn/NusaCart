package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.WishlistDTO;
import com.TryCatch.NusaCart.dto.WishlistResponseDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistResponseDTO>> getAllWishlists() {
        return ResponseEntity.ok(wishlistService.getAllWishlists());
    }

    @PostMapping
    public ResponseEntity<WishlistDTO> createWishlist() {
        return ResponseEntity.ok(wishlistService.createWishlist());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WishlistResponseDTO> getWishlistById(@PathVariable Integer id) {
        return ResponseEntity.ok(wishlistService.getWishlistByUserId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWishlist(@PathVariable Integer id) {
        wishlistService.deleteWishlist(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{wishlistId}/add/{productId}")
    public ResponseEntity<WishlistResponseDTO> addProduct(
            @PathVariable Integer wishlistId,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(wishlistService.addProductToWishlist(wishlistId, productId));
    }

    @PostMapping("/{wishlistId}/remove/{productId}")
    public ResponseEntity<WishlistResponseDTO> removeProduct(
            @PathVariable Integer wishlistId,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(wishlistService.removeProductFromWishlist(wishlistId, productId));
    }
}

