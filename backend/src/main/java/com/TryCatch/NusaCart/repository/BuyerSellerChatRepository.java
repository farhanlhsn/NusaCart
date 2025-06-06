package com.TryCatch.NusaCart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TryCatch.NusaCart.entity.BuyerSellerChatEntity;
import java.util.List;

public interface BuyerSellerChatRepository extends JpaRepository<BuyerSellerChatEntity, Integer> {
    List<BuyerSellerChatEntity> findBySenderIdAndReceiverId(Integer senderId, Integer receiverId);
}
