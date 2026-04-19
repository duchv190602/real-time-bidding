package com.duc.auction.mapper;

import com.duc.auction.dto.response.AuctionResponse;
import com.duc.auction.entity.Auction;
import org.springframework.stereotype.Component;

@Component
public class AuctionMapper {
    public AuctionResponse toResponse(Auction auction) {
        return new AuctionResponse(
                auction.getId(),
                auction.getProductName(),
                auction.getStartPrice(),
                auction.getMinIncrement(),
                auction.getStatus()
        );
    }
}
