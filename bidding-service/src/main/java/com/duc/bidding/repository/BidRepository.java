package com.duc.bidding.repository;

import com.duc.bidding.entity.BidRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<BidRecord, Long> {
}
