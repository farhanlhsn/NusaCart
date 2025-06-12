package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.CartCreateDTO;
import com.TryCatch.NusaCart.dto.CartResponseDTO;
import com.TryCatch.NusaCart.entity.*;
import com.TryCatch.NusaCart.repository.CartItemRepository;
import com.TryCatch.NusaCart.repository.CartRepository;
import com.TryCatch.NusaCart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

<<<<<<< Updated upstream

    private UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (UserEntity) auth.getPrincipal();
    }

    public List<CartResponseDTO> getUserCart() {
        UserEntity user = getCurrentUser();
        Optional<CartEntity> cartOpt = cartRepository.findByUser(user);
        if (cartOpt.isEmpty()) return List.of();

        CartEntity cart = cartOpt.get();

        return cart.getItems().stream().map(item -> {
=======
    public List<CartResponseDTO> getUserCart(Integer username) {
        UserEntity user = userRepository.findByUserId(username).orElseThrow();
        return cartRepository.findByUser(user).stream().map(cart -> {
>>>>>>> Stashed changes
            CartResponseDTO dto = new CartResponseDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getProductId());
            dto.setProductName(item.getProduct().getProductName());
            dto.setQuantity(item.getQuantity());
            dto.setPrice(item.getProduct().getPrice());
            return dto;
        }).collect(Collectors.toList());
    }

    public void addToCart(int username, CartCreateDTO dto) {
        UserEntity user = userRepository.findByUserId(username).orElseThrow();
        ProductEntity product = productRepository.findByProductId(dto.getProductId()).orElseThrow();
>>>>>>> Stashed changes

        // Find or create cart
        CartEntity cart = cartRepository.findByUser(user).orElseGet(() -> {
            CartEntity newCart = new CartEntity();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        // Check if item already exists in cart
        CartItemEntity existingItem = cart.getItems().stream()
            .filter(i -> i.getProduct().getProductId().equals(product.getProductId()))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + dto.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItemEntity newItem = new CartItemEntity();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(dto.getQuantity());
            cartItemRepository.save(newItem);
        }
    }

    public void removeCartItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }
}
