package com.duc.auction.mapper;

import com.duc.auction.dto.request.CreateAuctionRequest;
import com.duc.auction.dto.request.UpdateAuctionRequest;
import com.duc.auction.dto.response.AuctionResponse;
import com.duc.auction.entity.Auction;
import org.springframework.stereotype.Component;

@Component
public class AuctionMapper {
    public AuctionResponse toResponse(Auction auction) {
        if (auction == null) {
            return null;
        }
        return AuctionResponse.builder()
                .id(auction.getId())
                .title(auction.getTitle())
                .description(auction.getDescription())
                .startPrice(auction.getStartPrice())
                .currentPrice(auction.getCurrentPrice())
                .bidStep(auction.getBidStep())
                .startAt(auction.getStartAt())
                .endAt(auction.getEndAt())
                .status(auction.getStatus())
                .winnerId(auction.getWinnerId())
                .imageUrl(auction.getImageUrl())
                .imageFileType(auction.getImageFileType())
                .imageSize(auction.getImageSize())
                .imageMd5Checksum(auction.getImageMd5Checksum())
                .build();
    }

    public Auction toEntity(CreateAuctionRequest request) {
        if (request == null) {
            return null;
        }
        return Auction.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startPrice(request.getStartPrice())
                .currentPrice(request.getStartPrice()) // Initial currentPrice = startPrice
                .bidStep(request.getBidStep())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .build();
    }

    public void updateAuction(Auction auction, UpdateAuctionRequest request) {
        if (request == null) return;
        if (request.getTitle() != null) auction.setTitle(request.getTitle());
        if (request.getDescription() != null) auction.setDescription(request.getDescription());
        if (request.getStartPrice() != null) auction.setStartPrice(request.getStartPrice());
        if (request.getBidStep() != null) auction.setBidStep(request.getBidStep());
        if (request.getStartAt() != null) auction.setStartAt(request.getStartAt());
        if (request.getEndAt() != null) auction.setEndAt(request.getEndAt());
    }
}
