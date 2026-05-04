package com.duc.bidding.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidRequest {
    @NotNull(message = "Auction ID is required")
    private String auctionId;

    @NotNull(message = "Bid price is required")
    @Positive(message = "Bid price must be positive")
    private BigDecimal price;
}
