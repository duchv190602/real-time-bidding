package com.duc.auction.controller;

import com.duc.auction.constant.AuctionStatus;
import com.duc.auction.dto.request.CreateAuctionRequest;
import com.duc.auction.dto.request.UpdateAuctionRequest;
import com.duc.auction.dto.request.UpdateAuctionStatusRequest;
import com.duc.auction.dto.response.AuctionResponse;
import com.duc.auction.service.AuctionService;
import com.duc.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
//@RequestMapping("/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping( value = "/create",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AuctionResponse> createAuction(
            @RequestPart("request") @Valid CreateAuctionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ApiResponse.<AuctionResponse>builder()
                .result(auctionService.createAuction(request, file)).build();
    }


    @GetMapping
    public ApiResponse<Page<AuctionResponse>> getAuctions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) AuctionStatus status
    ) {
        return ApiResponse.<Page<AuctionResponse>>builder()
                .result(auctionService.getAuctions(page, size, status))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AuctionResponse> getAuction(@PathVariable String id) {
        return ApiResponse.<AuctionResponse>builder()
                .result(auctionService.getAuctionById(id)).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<AuctionResponse> updateAuction(
            @PathVariable String id,
            @RequestBody @Valid UpdateAuctionRequest request) {
        return ApiResponse.<AuctionResponse>builder()
                .result(auctionService.updateAuctionProduct(id, request)).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ApiResponse<AuctionResponse> updateAuctionStatus(
            @PathVariable String id,
            @RequestBody @Valid UpdateAuctionStatusRequest request) {
        return ApiResponse.<AuctionResponse>builder()
                .result(auctionService.updateAuctionStatus(id, request)).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AuctionResponse> updateAuctionImage(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.<AuctionResponse>builder()
                .result(auctionService.updateAuctionImage(id, file)).build();
    }
}
