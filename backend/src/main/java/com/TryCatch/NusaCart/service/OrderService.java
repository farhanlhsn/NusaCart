package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.*;
import com.TryCatch.NusaCart.entity.*;
import com.TryCatch.NusaCart.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

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
    private final PaymentMethodRepository paymentMethodRepository;
    private final DiscountRepository discountRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserService userService;

    public Map<String, String> placeOrder(OrderCreateDTO dto) {
        Integer userID = userService.getCurrentUser().getUserId();
        UserEntity user = userRepository.findByUserId(userID).orElseThrow();

        // 🛡️ Ensure address belongs to this user
        AddressEntity address = addressRepository.findById(dto.getAddressId())
                .filter(a -> a.getUser().getUserId().equals(userID))
                .orElseThrow(() -> new IllegalArgumentException("Invalid address for this user"));

        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(dto.getPaymentMethodId())
                .filter(PaymentMethodEntity::getIsActive)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive payment method"));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setAddress(address);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("PAID");
        order.setOrderStatus("PROCESSING");

        List<OrderItemEntity> items = dto.getItems().stream().map(itemDto -> {
            ProductEntity product = productRepository.findById(itemDto.getProductId()).orElseThrow();

            if (product.getStock() < itemDto.getQuantity()) {
                throw new IllegalArgumentException("Not enough stock for product: " + product.getProductName());
            }

            product.setStock(product.getStock() - itemDto.getQuantity());
            productRepository.save(product);

            OrderItemEntity item = new OrderItemEntity();
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(product.getPrice() * itemDto.getQuantity());
            item.setOrder(order);
            return item;
        }).collect(Collectors.toList());

        order.setItems(items);

        double total = items.stream().mapToDouble(OrderItemEntity::getPrice).sum();
        // promo code logic
        if (dto.getPromoCode() != null && !dto.getPromoCode().isEmpty()) {
            DiscountEntity discount = discountRepository.findByPromoCode(dto.getPromoCode())
                    .filter(DiscountEntity::isValid)
                    .orElseThrow(() -> new EntityNotFoundException("Promo code not found or expired"));

            if (discount.getUsageLimit() <= 0) {
                throw new IllegalArgumentException("Promo code usage limit reached");
            }
            double discountAmount = total * (discount.getDiscountPercentage() / 100.0);
            total -= discountAmount;

            discount.setUsageLimit(discount.getUsageLimit() - 1);
            discountRepository.save(discount);

            order.setDiscount(discount);
        }
        //Cart deletion logic
        order.setTotal(total);
        orderRepository.save(order);        
        CartEntity userCart = cartRepository.findByUser(user).orElse(null);
        if (userCart != null) {
        for (OrderItemEntity item : items) {
            cartItemRepository.deleteByCartAndProduct(userCart, item.getProduct());
        }
    }


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

            PaymentMethodDTO paymentMethodDTO = PaymentMethodDTO.builder()
                    .id(order.getPaymentMethod().getId())
                    .name(order.getPaymentMethod().getName())
                    .description(order.getPaymentMethod().getDescription())
                    .iconUrl(order.getPaymentMethod().getIconUrl())
                    .isActive(order.getPaymentMethod().getIsActive())
                    .type(order.getPaymentMethod().getType())
                    .build();
            dto.setPaymentMethod(paymentMethodDTO);
            dto.setPaymentStatus(order.getPaymentStatus());
            dto.setOrderStatus(order.getOrderStatus());

            // Add discount information if available
            if (order.getDiscount() != null) {
                DiscountDTO discountDTO = DiscountDTO.builder()
                        .promoCode(order.getDiscount().getPromoCode())
                        .description(order.getDiscount().getDescription())
                        .discountPercentage(order.getDiscount().getDiscountPercentage())
                        .validUntil(order.getDiscount().getValidUntil())
                        .usageLimit(order.getDiscount().getUsageLimit())
                        .valid(order.getDiscount().isValid())
                        .build();
                dto.setDiscount(discountDTO);
            }

            List<OrderItemResponseDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
                itemDto.setProductId(item.getProduct().getProductId());
                itemDto.setProductName(item.getProduct().getProductName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPrice(item.getPrice());
                itemDto.setStoreId(item.getProduct().getToko().getIdToko());
                itemDto.setStoreName(item.getProduct().getToko().getNamaToko());
                
                // Set first image URL only
                if (item.getProduct().getImageUrls() != null && !item.getProduct().getImageUrls().isEmpty()) {
                    itemDto.setImageUrl(item.getProduct().getImageUrls().get(0));
                }
                
                return itemDto;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
    }
}