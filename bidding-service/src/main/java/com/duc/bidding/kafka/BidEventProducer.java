package com.duc.bidding.kafka;

import com.duc.bidding.dto.event.BidEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class BidEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendBidEvent(BidEvent event) {
        log.info("Sending BidEvent successfully for auctionId: {} with new price: {}", event.getAuctionId(), event.getNewPrice());
        kafkaTemplate.send("bid-events", event.getAuctionId(), event);
    }
}
