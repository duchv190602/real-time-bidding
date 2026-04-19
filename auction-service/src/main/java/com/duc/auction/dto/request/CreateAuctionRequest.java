package com.duc.auction.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateAuctionRequest(
        @NotBlank String productName,
        @NotNull @DecimalMin("0.01") BigDecimal startPrice,
        @NotNull @DecimalMin("0.01") BigDecimal minIncrement
) {
}
