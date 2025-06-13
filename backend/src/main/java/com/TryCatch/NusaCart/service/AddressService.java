package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.AddressDTO;
import com.TryCatch.NusaCart.entity.AddressEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.AddressRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserService userService;

    public List<AddressDTO> getAllAddressesForCurrentUser() {
        UserEntity user = userService.getCurrentUser();
        return addressRepository.findByUser(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AddressDTO createAddress(AddressDTO dto) {
        UserEntity user = userService.getCurrentUser();

        if (dto.isUtama()) {
            resetAllAlamatUtama(user);
        }

        AddressEntity address = toEntity(dto);
        address.setUser(user);
        AddressEntity saved = addressRepository.save(address);
        return toDTO(saved);
    }

    @Transactional
    public AddressDTO updateAddress(Integer addressId, AddressDTO dto) {
        UserEntity user = userService.getCurrentUser();

        AddressEntity address = addressRepository.findByAddressIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Alamat tidak ditemukan"));

        address.setNamaPenerima(dto.getNamaPenerima());
        address.setJalan(dto.getJalan());
        address.setKelurahan(dto.getKelurahan());
        address.setKecamatan(dto.getKecamatan());
        address.setKotaKabupaten(dto.getKotaKabupaten());
        address.setProvinsi(dto.getProvinsi());
        address.setKodePos(dto.getKodePos());
        address.setPhoneNumber(dto.getPhoneNumber());

        if (dto.isUtama()) {
            resetAllAlamatUtama(user);
            address.setUtama(true);
        } else {
            boolean noMainExists = addressRepository.findByUser(user).stream().noneMatch(AddressEntity::isUtama);
            if (noMainExists) {
                address.setUtama(true);
            } else {
                address.setUtama(false);
            }
        }

        AddressEntity updated = addressRepository.save(address);
        return toDTO(updated);
    }

    public void deleteAddress(Integer addressId) {
        UserEntity user = userService.getCurrentUser();
        List<AddressEntity> allAddresses = addressRepository.findByUser(user);

        if (allAddresses.size() == 1) {
            throw new RuntimeException("Tidak dapat menghapus alamat terakhir.");
        }

        AddressEntity address = addressRepository.findByAddressIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Alamat tidak ditemukan"));

        if (address.isUtama()) {
            AddressEntity newMain = allAddresses.stream()
                    .filter(a -> !a.getAddressId().equals(addressId))
                    .findFirst()
                    .orElse(null);

            if (newMain != null) {
                newMain.setUtama(true);
                addressRepository.save(newMain);
            }
        }

        addressRepository.delete(address);
    }

    @Transactional
    public void setAsMainAddress(Integer addressId) {
        UserEntity user = userService.getCurrentUser();

        AddressEntity address = addressRepository.findByAddressIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Alamat tidak ditemukan"));

        resetAllAlamatUtama(user);
        address.setUtama(true);
        addressRepository.save(address);
    }

    private void resetAllAlamatUtama(UserEntity user) {
        List<AddressEntity> all = addressRepository.findByUser(user);
        for (AddressEntity a : all) {
            a.setUtama(false);
        }
        addressRepository.saveAll(all);
    }

    private AddressDTO toDTO(AddressEntity entity) {
        return AddressDTO.builder()
                .addressId(entity.getAddressId())
                .namaPenerima(entity.getNamaPenerima())
                .jalan(entity.getJalan())
                .kelurahan(entity.getKelurahan())
                .kecamatan(entity.getKecamatan())
                .kotaKabupaten(entity.getKotaKabupaten())
                .provinsi(entity.getProvinsi())
                .kodePos(entity.getKodePos())
                .phoneNumber(entity.getPhoneNumber())
                .isUtama(entity.isUtama())
                .build();
    }

    private AddressEntity toEntity(AddressDTO dto) {
        return AddressEntity.builder()
                .namaPenerima(dto.getNamaPenerima())
                .jalan(dto.getJalan())
                .kelurahan(dto.getKelurahan())
                .kecamatan(dto.getKecamatan())
                .kotaKabupaten(dto.getKotaKabupaten())
                .provinsi(dto.getProvinsi())
                .kodePos(dto.getKodePos())
                .phoneNumber(dto.getPhoneNumber())
                .isUtama(dto.isUtama())
                .build();
    }
}
