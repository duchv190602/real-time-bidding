package com.duc.bidding.service;

import com.duc.bidding.dto.event.BidEvent;
import com.duc.bidding.dto.request.BidRequest;
import com.duc.bidding.exception.AppException;
import com.duc.bidding.exception.ErrorCode;
import com.duc.bidding.kafka.BidEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RMap;
import org.redisson.api.RedissonClient;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class BiddingService {

    private final RedissonClient redissonClient;
    private final BidEventProducer bidEventProducer;
    private final SimpMessagingTemplate messagingTemplate;

    public void placeBid( BidRequest request) {
        log.info("bidding service 1 ");
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        String auctionId = request.getAuctionId();
        
        RLock lock = redissonClient.getLock("lock:auction:" + auctionId);
        
        try {
            boolean isLocked = lock.tryLock(3, 5, TimeUnit.SECONDS);
            if (!isLocked) {
                throw new AppException(ErrorCode.CONCURRENCY_ERROR);
            }
            
            RMap<String, String> auctionMap = redissonClient.getMap("auction:" + auctionId);
            if (auctionMap.isEmpty()) {
                throw new AppException(ErrorCode.AUCTION_NOT_FOUND);
            }
            
            checkTimeConstraints(auctionMap);
            
            BigDecimal currentPrice = new BigDecimal(auctionMap.get("currentPrice"));
            BigDecimal bidStep = new BigDecimal(auctionMap.get("bidStep"));
            BigDecimal minValidPrice = currentPrice.add(bidStep);
            
            if (request.getPrice().compareTo(minValidPrice) < 0) {
                throw new AppException(ErrorCode.PRICE_TOO_LOW);
            }
            
            // Record in Redis Cache
            auctionMap.put("currentPrice", request.getPrice().toString());
            log.info("bidding service 2");

            // Emit to Kafka natively
            BidEvent event = BidEvent.builder()
                .auctionId(auctionId)
                .userId(userId)
                .newPrice(request.getPrice())
                .bidAt(LocalDateTime.now())
                .build();
            log.info("bidding service 3");
            bidEventProducer.sendBidEvent(event);

            // Broadcast via WebSocket to all subscribers of this auction
            messagingTemplate.convertAndSend(
                "/topic/auction/" + auctionId,
                Map.of(
                    "auctionId", auctionId,
                    "newPrice",  request.getPrice(),
                    "bidderId",  userId,
                    "bidAt",     event.getBidAt().toString()
                )
            );
            log.info("Broadcasted bid update to /topic/auction/{}", auctionId);
            
        } catch (InterruptedException e) {
            log.error("Interrupted while acquiring lock", e);
            Thread.currentThread().interrupt();
            throw new AppException(ErrorCode.CONCURRENCY_ERROR);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    private void checkTimeConstraints(RMap<String, String> auctionMap) {
        LocalDateTime now = LocalDateTime.now();
        if (auctionMap.containsKey("startTime")) {
            LocalDateTime start = LocalDateTime.parse(auctionMap.get("startTime"));
            if (now.isBefore(start)) {
                throw new AppException(ErrorCode.AUCTION_NOT_STARTED);
            }
        }
        if (auctionMap.containsKey("endTime")) {
            LocalDateTime end = LocalDateTime.parse(auctionMap.get("endTime"));
            if (now.isAfter(end)) {
                throw new AppException(ErrorCode.AUCTION_ENDED);
            }
        }
    }
}
