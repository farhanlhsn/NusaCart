package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.AddressEntity;
import com.TryCatch.NusaCart.entity.UserEntity;

@Repository
public interface AddressRepository extends JpaRepository<AddressEntity, Integer> {

    List<AddressEntity> findByUser(UserEntity user);

    Optional<AddressEntity> findByAddressIdAndUser(Integer addressId, UserEntity user);

    boolean existsByAddressIdAndUser(Integer addressId, UserEntity user);
}
