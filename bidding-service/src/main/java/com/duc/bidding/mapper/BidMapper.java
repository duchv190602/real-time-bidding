package com.duc.bidding.mapper;

import com.duc.bidding.dto.response.BidResponse;
import com.duc.bidding.entity.BidRecord;
import org.springframework.stereotype.Component;

@Component
public class BidMapper {
    public BidResponse toResponse(BidRecord bidRecord) {
        return new BidResponse(bidRecord.getId(), bidRecord.getAuctionId(), bidRecord.getUserId(), bidRecord.getAmount());
    }
}
