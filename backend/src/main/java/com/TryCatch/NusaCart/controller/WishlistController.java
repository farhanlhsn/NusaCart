package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.WishlistDTO;
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
    public ResponseEntity<List<WishlistDTO>> getAllWishlists() {
        return ResponseEntity.ok(wishlistService.getAllWishlists());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WishlistDTO> getWishlistById(@PathVariable Integer id) {
        return ResponseEntity.ok(wishlistService.getWishlistById(id));
    }

    @PostMapping
    public ResponseEntity<WishlistDTO> createWishlist(@RequestBody WishlistDTO dto) {
        return ResponseEntity.ok(wishlistService.createWishlist(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WishlistDTO> updateWishlist(
            @PathVariable Integer id,
            @RequestBody WishlistDTO dto) {
        return ResponseEntity.ok(wishlistService.updateWishlist(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWishlist(@PathVariable Integer id) {
        wishlistService.deleteWishlist(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{wishlistId}/add/{productId}")
    public ResponseEntity<WishlistDTO> addProduct(
            @PathVariable Integer wishlistId,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(wishlistService.addProductToWishlist(wishlistId, productId));
    }

    @PostMapping("/{wishlistId}/remove/{productId}")
    public ResponseEntity<WishlistDTO> removeProduct(
            @PathVariable Integer wishlistId,
            @PathVariable Integer productId) {
        return ResponseEntity.ok(wishlistService.removeProductFromWishlist(wishlistId, productId));
    }
}

