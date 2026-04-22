package com.duc.auction.consumer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidEvent {
    private String auctionId;
    private String userId;
    private BigDecimal newPrice;
    private LocalDateTime bidAt;
}
