package com.duc.auction.repository;

import com.duc.auction.constant.AuctionStatus;
import com.duc.auction.entity.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AuctionRepository extends JpaRepository<Auction, String> {
    Page<Auction> findByStatus(AuctionStatus status, Pageable pageable);
    
    Page<Auction> findByStatusIn(List<AuctionStatus> statuses, Pageable pageable);
    
    List<Auction> findByStatusAndStartAtLessThanEqual(AuctionStatus status, LocalDateTime startAt);
    
    List<Auction> findByStatusAndEndAtLessThanEqual(AuctionStatus status, LocalDateTime endAt);
}
