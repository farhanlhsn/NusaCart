package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.*;
import com.TryCatch.NusaCart.entity.*;
import com.TryCatch.NusaCart.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public void placeOrder(String username, OrderCreateDTO orderCreateDTO) {
        UserEntity user = userRepository.findByUsername(username).orElseThrow();

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItemEntity> items = orderCreateDTO.getItems().stream().map(dto -> {
            ProductEntity product = productRepository.findById(dto.getProductId()).orElseThrow();

            OrderItemEntity item = new OrderItemEntity();
            item.setProduct(product);
            item.setQuantity(dto.getQuantity());
            item.setPrice(product.getPrice() * dto.getQuantity());
            item.setOrder(order);

            return item;
        }).collect(Collectors.toList());

        order.setItems(items);
        order.setTotal(items.stream().mapToDouble(OrderItemEntity::getPrice).sum());

        orderRepository.save(order);
    }

    public List<OrderResponseDTO> getOrders(String username) {
        UserEntity user = userRepository.findByUsername(username).orElseThrow();

        return orderRepository.findByUser(user).stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setTotal(order.getTotal());

            List<OrderItemResponseDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
                itemDto.setProductName(item.getProduct().getProductName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPrice(item.getPrice());
                return itemDto;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
    }
}
