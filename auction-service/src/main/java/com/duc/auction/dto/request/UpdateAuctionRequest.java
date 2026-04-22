package com.duc.auction.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateAuctionRequest {
    private String title;
    
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Start price must be greater than 0")
    private BigDecimal startPrice;

    @DecimalMin(value = "0.0", inclusive = false, message = "Bid step must be greater than 0")
    private BigDecimal bidStep;

    private LocalDateTime startAt;

    private LocalDateTime endAt;
}
