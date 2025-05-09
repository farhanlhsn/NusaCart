package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.entity.TokoEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokoDTO {
    private Integer idToko;
    private String namaToko;
    private String deskripsiToko;
    private String alamatToko;
    private Integer idSeller;
    private String sellerName;
    private String noTelpToko;
    private String emailToko;
    private String profilePictureToko;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor to convert entity to DTO
    public TokoDTO(TokoEntity toko) {
        this.idToko = toko.getIdToko();
        this.namaToko = toko.getNamaToko();
        this.deskripsiToko = toko.getDeskripsiToko();
        this.alamatToko = toko.getAlamatToko();
        this.idSeller = toko.getSeller().getUserId();
        this.sellerName = toko.getSeller().getName();
        this.noTelpToko = toko.getNoTelpToko();
        this.emailToko = toko.getEmailToko();
        this.profilePictureToko = toko.getProfilePictureToko();
        this.createdAt = toko.getCreatedAt();
        this.updatedAt = toko.getUpdatedAt();
    }
}
