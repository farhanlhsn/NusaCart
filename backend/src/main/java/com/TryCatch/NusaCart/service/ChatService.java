package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.BuyerSellerChatDTO;
import com.TryCatch.NusaCart.dto.ReportChatDTO;
import com.TryCatch.NusaCart.entity.BuyerSellerChatEntity;
import com.TryCatch.NusaCart.entity.ReportChatEntity;
import com.TryCatch.NusaCart.repository.BuyerSellerChatRepository;
import com.TryCatch.NusaCart.repository.ReportChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService implements ChatServiceInterface {

    private final BuyerSellerChatRepository buyerSellerChatRepository;
    private final ReportChatRepository reportChatRepository;

    @Override
    public BuyerSellerChatDTO saveBuyerSellerChat(BuyerSellerChatDTO dto) {
        BuyerSellerChatEntity entity = new BuyerSellerChatEntity();
        entity.setSenderId(dto.getSenderId());
        entity.setReceiverId(dto.getReceiverId());
        entity.setMessage(dto.getMessage());
        entity.setTimestamp(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        entity.setProductId(dto.getProductId());
        entity.setOrderId(dto.getOrderId());

        BuyerSellerChatEntity saved = buyerSellerChatRepository.save(entity);
        dto.setChatId(saved.getChatId());
        dto.setTimestamp(saved.getTimestamp());
        return dto;
    }

   @Override
    public ReportChatEntity reportChat(ReportChatDTO reportChatDTO, Integer reporterId) {
        ReportChatEntity entity = ReportChatEntity.builder()
                .reporterId(reporterId)
                .reportedUserId(reportChatDTO.getReportedUserId())
                .reason(reportChatDTO.getReason())
                .description(reportChatDTO.getDescription())
                .timestamp(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")))
                .build();

        return reportChatRepository.save(entity);
}

    @Override
    public List<BuyerSellerChatDTO> getChatsBetween(Integer senderId, Integer receiverId) {
        return buyerSellerChatRepository.findBySenderIdAndReceiverId(senderId, receiverId)
                .stream()
                .map(entity -> BuyerSellerChatDTO.builder()
                        .chatId(entity.getChatId())
                        .senderId(entity.getSenderId())
                        .receiverId(entity.getReceiverId())
                        .message(entity.getMessage())
                        .timestamp(entity.getTimestamp())
                        .productId(entity.getProductId())
                        .orderId(entity.getOrderId())
                        .build())
                .collect(Collectors.toList());
    }
}