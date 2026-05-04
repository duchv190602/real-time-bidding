package com.duc.auction.consumer;

import com.duc.auction.constant.AuctionStatus;
import com.duc.auction.dto.event.BidEvent;
import com.duc.auction.entity.Auction;
import com.duc.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidEventConsumer {
    private final AuctionRepository auctionRepository;

    @KafkaListener(topics = "bid-events", groupId = "auction-group")
    public void consume(BidEvent event) {
        log.info("Received bid event: {}", event);
        try {
            String auctionId = event.getAuctionId();
            Optional<Auction> optionalAuction = auctionRepository.findById(auctionId);
            
            if (optionalAuction.isPresent()) {
                Auction auction = optionalAuction.get();
                // Validate if auction is ACTIVE
                if (auction.getStatus() == AuctionStatus.ACTIVE) {
                    if (event.getNewPrice().compareTo(auction.getCurrentPrice()) > 0) {
                        auction.setCurrentPrice(event.getNewPrice());
                        // Update the winner to the newest highest bidder
                        auction.setWinnerId(event.getUserId());
                        auctionRepository.save(auction);
                        log.info("Successfully updated auction price to {} for auctionId: {}", event.getNewPrice(), auctionId);
                    } else {
                        log.warn("New bid price {} is not higher than current price {} for auctionId: {}", 
                            event.getNewPrice(), auction.getCurrentPrice(), auctionId);
                    }
                } else {
                    log.warn("Received bid for non-active auction: {}", auctionId);
                }
            } else {
                log.error("Auction not found for ID: {}", auctionId);
            }
        } catch (Exception e) {
            log.error("Error processing bid event", e);
        }
    }
}
