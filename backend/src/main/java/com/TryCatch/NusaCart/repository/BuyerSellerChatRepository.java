package com.TryCatch.NusaCart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TryCatch.NusaCart.entity.BuyerSellerChatEntity;
import java.util.List;

public interface BuyerSellerChatRepository extends JpaRepository<BuyerSellerChatEntity, Integer> {
    List<BuyerSellerChatEntity> findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
    Integer senderId1, Integer receiverId1,
    Integer senderId2, Integer receiverId2);

}
