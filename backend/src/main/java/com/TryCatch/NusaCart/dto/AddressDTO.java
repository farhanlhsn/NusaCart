package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressDTO {

    private Integer addressId;

    @NotNull(message = "User ID tidak boleh null")
    private Integer userId;

    @NotBlank(message = "Nama penerima tidak boleh kosong")
    private String namaPenerima;

    @NotBlank(message = "Jalan tidak boleh kosong")
    private String jalan;

    @NotBlank(message = "Kelurahan tidak boleh kosong")
    private String kelurahan;

    @NotBlank(message = "Kecamatan tidak boleh kosong")
    private String kecamatan;

    @NotBlank(message = "Kota/Kabupaten tidak boleh kosong")
    private String kotaKabupaten;

    @NotBlank(message = "Provinsi tidak boleh kosong")
    private String provinsi;

    @NotBlank(message = "Kode pos tidak boleh kosong")
    private String kodePos;

    @NotBlank(message = "Nomor telepon tidak boleh kosong")
    private String phoneNumber;

    private boolean isUtama;
}
