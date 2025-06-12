package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.PaymentRequestDTO;
import com.TryCatch.NusaCart.dto.PaymentResponseDTO;
import com.TryCatch.NusaCart.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public PaymentResponseDTO makePayment(@RequestBody PaymentRequestDTO dto) {
        return paymentService.processPayment(dto);
    }

    @GetMapping
    public List<PaymentResponseDTO> getUserPayments() {
        return paymentService.getUserPayments();
    }
}
