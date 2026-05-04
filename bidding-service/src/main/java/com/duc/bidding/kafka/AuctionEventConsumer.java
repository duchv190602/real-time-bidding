package com.duc.bidding.kafka;

import com.duc.bidding.dto.event.AuctionCreatedEvent;
import com.duc.bidding.dto.event.AuctionEndedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RMap;
import org.redisson.api.RedissonClient;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuctionEventConsumer {

    private final RedissonClient redissonClient;

    @KafkaListener(topics = "auction-created", groupId = "bidding-service")
    public void consumeAuctionCreated(AuctionCreatedEvent event) {
        log.info("Received auction-created event for warm-up, auctionId: {}", event.getAuctionId());
        
        RMap<String, String> auctionMap = redissonClient.getMap("auction:" + event.getAuctionId());
        auctionMap.put("currentPrice", event.getStartPrice().toString());
        auctionMap.put("bidStep", event.getBidStep().toString());
        if (event.getStartTime() != null) {
            auctionMap.put("startTime", event.getStartTime().toString());
        }
        if (event.getEndTime() != null) {
            auctionMap.put("endTime", event.getEndTime().toString());
            // Passive TTL: Tự hủy sau khi kết thúc + 30 phút buffer
            Duration ttl = Duration.between(LocalDateTime.now(), event.getEndTime()).plusMinutes(30);
            if (!ttl.isNegative()) {
                auctionMap.expire(ttl);
                log.info("Set TTL for auction: {} to {} minutes", event.getAuctionId(), ttl.toMinutes());
            }
        }
        
        log.info("Successfully populated Redis Cache for auctionId: {}", event.getAuctionId());
    }

    @KafkaListener(topics = "auction-ended", groupId = "bidding-service")
    public void consumeAuctionEnded(AuctionEndedEvent event) {
        log.info("Received auction-ended event, deleting cache for auctionId: {}", event.getAuctionId());
        RMap<String, String> auctionMap = redissonClient.getMap("auction:" + event.getAuctionId());
        auctionMap.delete();
        log.info("Successfully deleted Redis Cache for auctionId: {}", event.getAuctionId());
    }
}
