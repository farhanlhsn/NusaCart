package com.TryCatch.NusaCart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "addresses")
public class AddressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id", nullable = false, unique = true)
    private Integer addressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "nama_penerima", nullable = false)
    private String namaPenerima;

    @Column(name = "jalan", nullable = false)
    private String jalan;

    @Column(name = "kelurahan", nullable = false)
    private String kelurahan;

    @Column(name = "kecamatan", nullable = false)
    private String kecamatan;

    @Column(name = "kota_kabupaten", nullable = false)
    private String kotaKabupaten;

    @Column(name = "provinsi", nullable = false)
    private String provinsi;

    @Column(name = "kode_pos", nullable = false)
    private String kodePos;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "is_utama")
    private boolean isUtama;
}
