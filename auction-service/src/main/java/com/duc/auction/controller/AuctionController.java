package com.duc.auction.controller;

import com.duc.auction.dto.request.CreateAuctionRequest;
import com.duc.auction.dto.response.AuctionResponse;
import com.duc.auction.service.AuctionService;
import com.duc.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auctions")
public class AuctionController {
    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping
    public ApiResponse<List<AuctionResponse>> list() {
        return ApiResponse.ok(auctionService.findAll());
    }

    @PostMapping
    public ApiResponse<AuctionResponse> create(@Valid @RequestBody CreateAuctionRequest request) {
        return ApiResponse.ok(auctionService.create(request));
    }
}
