package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.CartCreateDTO;
import com.TryCatch.NusaCart.dto.CartResponseDTO;
import com.TryCatch.NusaCart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public List<CartResponseDTO> getCart(Principal principal) {
        return cartService.getUserCart();
    }

    @PostMapping
    public void addToCart(@RequestBody CartCreateDTO dto, Principal principal) {
        cartService.addToCart(dto);
    }

    @DeleteMapping("/{id}")
    public void removeFromCart(@PathVariable Long id) {
        cartService.removeCartItem(id);
    }
}