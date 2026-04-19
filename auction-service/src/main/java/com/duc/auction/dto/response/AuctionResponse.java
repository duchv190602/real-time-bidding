package com.duc.auction.dto.response;

import java.math.BigDecimal;

public record AuctionResponse(Long id, String productName, BigDecimal startPrice, BigDecimal minIncrement, String status) {
}
