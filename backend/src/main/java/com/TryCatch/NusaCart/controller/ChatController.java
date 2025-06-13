package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.BuyerSellerChatDTO;
import com.TryCatch.NusaCart.dto.ReportChatDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.service.ChatServiceInterface;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatServiceInterface chatService;

    @PostMapping("/send")
    public BuyerSellerChatDTO sendBuyerSellerChat(
            @RequestBody BuyerSellerChatDTO dto,
            Authentication authentication) {

        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        dto.setSenderId(currentUser.getUserId());
        return chatService.saveBuyerSellerChat(dto);
    }

    @PostMapping("/report")
    public ResponseEntity<?> reportChat(@RequestBody ReportChatDTO dto, Authentication authentication) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        dto.setReporterId(currentUser.getUserId()); 
        chatService.reportChat(dto, currentUser.getUserId());
        return ResponseEntity.ok("Reported successfully");
    }

    @GetMapping("/history")
    public List<BuyerSellerChatDTO> getChatHistory(
            @RequestParam Integer receiverId,
            Authentication authentication) {

        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        Integer senderId = currentUser.getUserId();
        return chatService.getChatsBetween(senderId, receiverId);
    }

}
