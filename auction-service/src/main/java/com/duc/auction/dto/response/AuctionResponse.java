package com.duc.auction.dto.response;

import com.duc.auction.constant.AuctionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionResponse {
    private String id;
    private String title;
    private String description;
    private BigDecimal startPrice;
    private BigDecimal currentPrice;
    private BigDecimal bidStep;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private AuctionStatus status;
    private String winnerId;
    private String imageUrl;
    private String imageFileType;
    private Long imageSize;
    private String imageMd5Checksum;
}
