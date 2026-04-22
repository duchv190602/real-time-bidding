package com.duc.auction.dto.request;

import com.duc.auction.constant.AuctionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAuctionStatusRequest {
    @NotNull(message = "Status cannot be null")
    private AuctionStatus status;
}
