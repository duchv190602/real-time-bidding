package com.duc.bidding.service;

import com.duc.bidding.dto.request.PlaceBidRequest;
import com.duc.bidding.dto.response.BidResponse;
import com.duc.bidding.entity.BidRecord;
import com.duc.bidding.mapper.BidMapper;
import com.duc.bidding.repository.BidRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class BiddingService {
    private final BidRepository bidRepository;
    private final BidMapper bidMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public BiddingService(BidRepository bidRepository, BidMapper bidMapper, KafkaTemplate<String, String> kafkaTemplate) {
        this.bidRepository = bidRepository;
        this.bidMapper = bidMapper;
        this.kafkaTemplate = kafkaTemplate;
    }

    public BidResponse placeBid(PlaceBidRequest request) {
        BidRecord bidRecord = new BidRecord();
        bidRecord.setAuctionId(request.auctionId());
        bidRecord.setUserId(request.userId());
        bidRecord.setAmount(request.amount());
        BidRecord saved = bidRepository.save(bidRecord);
        kafkaTemplate.send("rtb.bids", request.auctionId().toString(), request.amount().toPlainString());
        return bidMapper.toResponse(saved);
    }
}
