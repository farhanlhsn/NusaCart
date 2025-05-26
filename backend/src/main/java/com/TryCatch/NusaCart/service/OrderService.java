package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.*;
import com.TryCatch.NusaCart.entity.*;
import com.TryCatch.NusaCart.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final UserService userService;

    public Map<String, String> placeOrder(OrderCreateDTO dto) {
        Integer userID = userService.getCurrentUser().getUserId();
        UserEntity user = userRepository.findByUserId(userID).orElseThrow();

        // 🛡️ Ensure address belongs to this user
        AddressEntity address = addressRepository.findById(dto.getAddressId())
                .filter(a -> a.getUser().getUserId().equals(userID))
                .orElseThrow(() -> new IllegalArgumentException("Invalid address for this user"));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setAddress(address);

        List<OrderItemEntity> items = dto.getItems().stream().map(itemDto -> {
            ProductEntity product = productRepository.findById(itemDto.getProductId()).orElseThrow();

            OrderItemEntity item = new OrderItemEntity();
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(product.getPrice() * itemDto.getQuantity());
            item.setOrder(order);

            return item;
        }).collect(Collectors.toList());

        order.setItems(items);
        order.setTotal(items.stream().mapToDouble(OrderItemEntity::getPrice).sum());

        orderRepository.save(order);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Order placed successfully");
        return response;
    }

    public List<OrderResponseDTO> getOrders() {
        Integer userID = userService.getCurrentUser().getUserId();
        UserEntity user = userRepository.findByUserId(userID).orElseThrow();

        return orderRepository.findByUser(user).stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setCreatedAt(order.getCreatedAt());
            dto.setTotal(order.getTotal());

            AddressEntity addr = order.getAddress();
            dto.setAddress(String.format("%s, %s, %s, %s, %s, %s (%s)",
                addr.getJalan(),
                addr.getKelurahan(),
                addr.getKecamatan(),
                addr.getKotaKabupaten(),
                addr.getProvinsi(),
                addr.getKodePos(),
                addr.getPhoneNumber()
            ));

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
