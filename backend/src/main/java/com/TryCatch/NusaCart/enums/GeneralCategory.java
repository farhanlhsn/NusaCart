package com.TryCatch.NusaCart.enums;

public enum GeneralCategory {
    ELEKTRONIK("Elektronik"),
    FURNITUR("Furnitur"),
    PAKAIAN("Pakaian"),
    MAKANAN_MINUMAN("Makanan & Minuman"),
    KESEHATAN_KECANTIKAN("Kesehatan & Kecantikan"),
    OLAHRAGA_OUTDOOR("Olahraga & Outdoor"),
    OTOMOTIF("Otomotif"),
    BUKU_ALAT_TULIS("Buku & Alat Tulis"),
    MAINAN_HOBI("Mainan & Hobi"),
    RUMAH_TANGGA("Rumah Tangga"),
    PERHIASAN_AKSESORIS("Perhiasan & Aksesoris"),
    LAINNYA("Lainnya");

    private final String displayName;

    GeneralCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}