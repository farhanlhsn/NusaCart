package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.AddressDTO;
import com.TryCatch.NusaCart.service.AddressService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
@Slf4j
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAllAddresses() {
        log.info("Fetching all addresses for current user");
        List<AddressDTO> addresses = addressService.getAllAddressesForCurrentUser();
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/new_address")
    public ResponseEntity<AddressDTO> addAddress(@RequestBody @Valid AddressDTO dto) {
        AddressDTO created = addressService.createAddress(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update_address/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Integer addressId,
            @Valid @RequestBody AddressDTO dto
    ) {
        log.info("Updating address with ID {}: {}", addressId, dto);
        AddressDTO updated = addressService.updateAddress(addressId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/remove_address/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Integer addressId) {
        log.info("Deleting address with ID {}", addressId);
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/set_main/{addressId}")
    public ResponseEntity<String> setAsMainAddress(@PathVariable Integer addressId) {
        log.info("Setting address {} as main", addressId);
        addressService.setAsMainAddress(addressId);
        return ResponseEntity.ok("Alamat utama berhasil diperbarui.");
    }
}
