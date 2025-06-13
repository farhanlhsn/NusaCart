package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.BuyerSellerChatDTO;
import com.TryCatch.NusaCart.dto.ReportChatDTO;
import com.TryCatch.NusaCart.entity.ReportChatEntity;

import java.util.List;

public interface ChatServiceInterface {
    BuyerSellerChatDTO saveBuyerSellerChat(BuyerSellerChatDTO dto);
    
    ReportChatEntity reportChat(ReportChatDTO reportChatDTO, Integer reporterId);

    List<BuyerSellerChatDTO> getChatsBetween(Integer senderId, Integer receiverId);
}
