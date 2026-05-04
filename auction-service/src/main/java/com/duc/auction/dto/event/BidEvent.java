package com.duc.auction.dto.event;

import lombok.*;

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
