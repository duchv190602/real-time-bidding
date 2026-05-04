package com.duc.auction.producer;

import com.duc.auction.dto.event.AuctionCreatedEvent;
import com.duc.auction.dto.event.AuctionEndedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendAuctionCreatedEvent(AuctionCreatedEvent event) {
        log.info("Sending auction-created event for auctionId: {}", event.getAuctionId());
        kafkaTemplate.send("auction-created", event);
    }

    public void sendAuctionEndedEvent(AuctionEndedEvent event) {
        log.info("Sending auction-ended event for auctionId: {}", event.getAuctionId());
        kafkaTemplate.send("auction-ended", event);
    }
}
