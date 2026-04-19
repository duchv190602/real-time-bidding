package com.duc.bidding.dto.response;

import java.math.BigDecimal;

public record BidResponse(Long id, Long auctionId, Long userId, BigDecimal amount) {
}
