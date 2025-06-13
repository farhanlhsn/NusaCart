package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.WishlistResponseDTO;
import com.TryCatch.NusaCart.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<WishlistResponseDTO> getCurrentUserWishlist() {
        try {
            WishlistResponseDTO wishlist = wishlistService.getCurrentUserWishlist();
            WishlistResponseDTO response = new WishlistResponseDTO(
                "Berhasil mengambil data wishlist", 
                wishlist
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            WishlistResponseDTO errorResponse = new WishlistResponseDTO(
                "error", 
                "Gagal mengambil data wishlist: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistResponseDTO> addProduct(
            @PathVariable Integer productId) {
        try {
            WishlistResponseDTO wishlist = wishlistService.addProductToCurrentUserWishlist(productId);
            WishlistResponseDTO response = new WishlistResponseDTO(
                "Produk berhasil ditambahkan ke wishlist", 
                wishlist
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            HttpStatus status;
            
            if (message.contains("tidak ditemukan")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("sudah ada")) {
                status = HttpStatus.CONFLICT;
            } else {
                status = HttpStatus.BAD_REQUEST;
            }
            
            WishlistResponseDTO errorResponse = new WishlistResponseDTO(
                "error", 
                message
            );
            return ResponseEntity.status(status).body(errorResponse);
        } catch (Exception e) {
            WishlistResponseDTO errorResponse = new WishlistResponseDTO(
                "error", 
                "Gagal menambahkan produk ke wishlist: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<WishlistResponseDTO> removeProduct(
            @PathVariable Integer productId) {
        try {
            WishlistResponseDTO wishlist = wishlistService.removeProductFromCurrentUserWishlist(productId);
            WishlistResponseDTO response = new WishlistResponseDTO(
                "Produk berhasil dihapus dari wishlist", 
                wishlist
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            HttpStatus status;
            
            if (message.contains("tidak ditemukan")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("tidak ada di wishlist")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.BAD_REQUEST;
            }
            
            WishlistResponseDTO errorResponse = new WishlistResponseDTO(
                "error", 
                message
            );
            return ResponseEntity.status(status).body(errorResponse);
        } catch (Exception e) {
            WishlistResponseDTO errorResponse = new WishlistResponseDTO(
                "error", 
                "Gagal menghapus produk dari wishlist: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}