package com.duc.bidding.controller;

import com.duc.bidding.dto.request.BidRequest;
import com.duc.bidding.service.BiddingService;
import com.duc.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
@Slf4j
@RestController
@RequiredArgsConstructor
public class BidController {

    private final BiddingService biddingService;
    @PreAuthorize("hasRole('USER')")
    @RequestMapping("/place-bid")
    @PostMapping
    public ApiResponse<String> placeBid(
            @RequestBody @Valid BidRequest request) {
        log.info("bidding controller");
        biddingService.placeBid( request);
        
        return ApiResponse.<String>builder()
                .code(1000)
                .message("Bid placed successfully")
                .build();
    }
}
