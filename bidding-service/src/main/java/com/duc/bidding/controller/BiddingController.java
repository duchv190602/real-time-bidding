package com.duc.bidding.controller;

import com.duc.bidding.dto.request.PlaceBidRequest;
import com.duc.bidding.dto.response.BidResponse;
import com.duc.bidding.service.BiddingService;
import com.duc.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bids")
public class BiddingController {
    private final BiddingService biddingService;

    public BiddingController(BiddingService biddingService) {
        this.biddingService = biddingService;
    }

    @PostMapping
    public ApiResponse<BidResponse> placeBid(@Valid @RequestBody PlaceBidRequest request) {
        return ApiResponse.ok(biddingService.placeBid(request));
    }
}
