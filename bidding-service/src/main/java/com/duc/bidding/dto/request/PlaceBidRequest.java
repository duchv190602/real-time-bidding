package com.duc.bidding.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PlaceBidRequest(
        @NotNull Long auctionId,
        @NotNull Long userId,
        @NotNull @DecimalMin("0.01") BigDecimal amount
) {
}
