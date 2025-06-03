package com.TryCatch.NusaCart.dto;

import com.TryCatch.NusaCart.entity.ProductEntity;
import java.util.List;

public class WishlistDTO {
    private Integer wishlistId;
    private Integer userId;
    private List<ProductEntity> products;

    public Integer getWishlistId() { return wishlistId; }
    public void setWishlistId(Integer wishlistId) { this.wishlistId = wishlistId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public List<ProductEntity> getProducts() { return products; }
    public void setProducts(List<ProductEntity> products) { this.products = products; }
}
