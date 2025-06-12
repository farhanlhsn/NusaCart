package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.CartCreateDTO;
import com.TryCatch.NusaCart.dto.CartResponseDTO;
import com.TryCatch.NusaCart.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService){
        this.cartService = cartService;
    }

    @GetMapping
    public List<CartResponseDTO> getCart() {
        return cartService.getUserCart();
    }

    @PostMapping
    public void addToCart(@RequestBody CartCreateDTO dto, Principal principal) {
        cartService.addToCart(principal.getName(), dto);
    }

    @PutMapping("/{id}")
    public void updateCartItemQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        cartService.updateCartItemQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    public void removeFromCart(@PathVariable Long id) {
        cartService.removeCartItem(id);
    }
}