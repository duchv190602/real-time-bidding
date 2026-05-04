package com.duc.auction.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateAuctionRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Start price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Start price must be greater than 0")
    private BigDecimal startPrice;

    @NotNull(message = "Bid step is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Bid step must be greater than 0")
    private BigDecimal bidStep;

    @NotNull(message = "Start time is required")
    private LocalDateTime startAt;

    private LocalDateTime endAt;
}
