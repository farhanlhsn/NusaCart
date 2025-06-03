package com.TryCatch.NusaCart.service;


import com.TryCatch.NusaCart.dto.CartCreateDTO;
import com.TryCatch.NusaCart.dto.CartResponseDTO;
import com.TryCatch.NusaCart.entity.CartEntity;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.CartRepository;
import com.TryCatch.NusaCart.repository.ProductRepository;
import com.TryCatch.NusaCart.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CartResponseDTO> getUserCart(int username) {
        UserEntity user = userRepository.findByUserId(username).orElseThrow();
        return cartRepository.findByUser(user).stream().map(cart -> {
            CartResponseDTO dto = new CartResponseDTO();
            dto.setId(cart.getId());
            dto.setProductId(cart.getProduct().getProductId());
            dto.setProductName(cart.getProduct().getProductName());
            dto.setQuantity(cart.getQuantity());
            dto.setPrice(cart.getProduct().getPrice());
            return dto;
        }).collect(Collectors.toList());
    }

    public void addToCart(int username, CartCreateDTO dto) {
        UserEntity user = userRepository.findByUserId(username).orElseThrow();
        ProductEntity product = productRepository.findByProductId(dto.getProductId()).orElseThrow();

        CartEntity cart = new CartEntity();
        cart.setUser(user);
        cart.setProduct(product);
        cart.setQuantity(dto.getQuantity());

        cartRepository.save(cart);
    }

    public void removeCartItem(Long id) {
        cartRepository.deleteById(id);
    }
}
