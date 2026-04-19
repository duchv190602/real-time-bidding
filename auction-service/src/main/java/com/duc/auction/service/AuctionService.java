package com.duc.auction.service;

import com.duc.auction.dto.request.CreateAuctionRequest;
import com.duc.auction.dto.response.AuctionResponse;
import com.duc.auction.entity.Auction;
import com.duc.auction.mapper.AuctionMapper;
import com.duc.auction.repository.AuctionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuctionService {
    private final AuctionRepository auctionRepository;
    private final AuctionMapper auctionMapper;

    public AuctionService(AuctionRepository auctionRepository, AuctionMapper auctionMapper) {
        this.auctionRepository = auctionRepository;
        this.auctionMapper = auctionMapper;
    }

    public List<AuctionResponse> findAll() {
        return auctionRepository.findAll().stream().map(auctionMapper::toResponse).toList();
    }

    public AuctionResponse create(CreateAuctionRequest request) {
        Auction auction = new Auction();
        auction.setProductName(request.productName());
        auction.setStartPrice(request.startPrice());
        auction.setMinIncrement(request.minIncrement());
        auction.setStatus("UPCOMING");
        return auctionMapper.toResponse(auctionRepository.save(auction));
    }
}
