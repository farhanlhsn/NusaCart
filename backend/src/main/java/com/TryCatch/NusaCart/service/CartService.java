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
/* com */
@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;


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
            CartResponseDTO dto = new CartResponseDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getProductId());
            dto.setProductName(item.getProduct().getProductName());
            dto.setQuantity(item.getQuantity());
            dto.setPrice(item.getProduct().getPrice());
            dto.setImageUrl(item.getProduct().getImageUrl());
            
            // Store information
            dto.setStoreId(item.getProduct().getToko().getIdToko());
            dto.setStoreName(item.getProduct().getToko().getNamaToko());
            // Use only city/regency from the full address
            String fullAddress = item.getProduct().getToko().getAlamatToko();
            // Extract city/regency - assume it's after the street and before province
            // For now, we'll use a simple approach to get the city part
            String[] addressParts = fullAddress.split(",");
            String cityPart = addressParts.length > 1 ? addressParts[1].trim() : fullAddress;
            dto.setStoreLocation(cityPart);
            
            return dto;
        }).collect(Collectors.toList());
    }

    public void addToCart(CartCreateDTO dto) {
        UserEntity user = getCurrentUser();
        ProductEntity product = productRepository.findByProductId(dto.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

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

    public void updateCartItemQuantity(Long itemId, Integer quantity) {
        if (quantity < 1) {
            throw new RuntimeException("Quantity must be at least 1");
        }
        
        CartItemEntity cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        // Verify cart item belongs to current user
        UserEntity currentUser = getCurrentUser();
        if (!cartItem.getCart().getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }
        
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
    }

    public void removeCartItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }
}