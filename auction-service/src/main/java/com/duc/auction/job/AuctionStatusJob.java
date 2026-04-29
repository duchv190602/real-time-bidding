package com.duc.auction.job;

import com.duc.auction.constant.AuctionStatus;
import com.duc.auction.dto.event.AuctionCreatedEvent;
import com.duc.auction.entity.Auction;
import com.duc.auction.producer.AuctionEventProducer;
import com.duc.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionStatusJob {

    private final AuctionRepository auctionRepository;
    private final AuctionEventProducer auctionEventProducer;

    @Scheduled(fixedRate = 60000) // Chạy mỗi phút
    @Transactional
    public void scheduleAuctionStatusUpdates() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Running AuctionStatusJob at {}", now);

        // 1. APPROVED -> ACTIVE (Kích hoạt đấu giá khi đến giờ startAt)
        List<Auction> approvedAuctions = auctionRepository.findByStatusAndStartAtLessThanEqual(AuctionStatus.APPROVED, now);
        for (Auction auction : approvedAuctions) {
            log.info("Activating auction: {}", auction.getId());
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            
            auctionEventProducer.sendAuctionCreatedEvent(
                            AuctionCreatedEvent.builder()
                            .auctionId(auction.getId())
                            .startPrice(auction.getStartPrice())
                            .bidStep(auction.getBidStep())
                            .startTime(auction.getStartAt())
                            .endTime(auction.getEndAt())
                            .build()
            );
        }

        // 2. ACTIVE -> ENDED (Kết thúc đấu giá khi qua giờ endAt)
        List<Auction> activeAuctions = auctionRepository.findByStatusAndEndAtLessThanEqual(AuctionStatus.ACTIVE, now);
        for (Auction auction : activeAuctions) {
            log.info("Ending auction: {}", auction.getId());
            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);
            
            auctionEventProducer.sendAuctionEndedEvent(
                    com.duc.auction.dto.event.AuctionEndedEvent.builder()
                            .auctionId(auction.getId())
                            .build()
            );
        }
    }
}
