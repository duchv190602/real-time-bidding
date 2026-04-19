package com.duc.identity.dto.request;

import jakarta.validation.constraints.NotBlank;

public record GoogleCallbackRequest(@NotBlank String code) {
}
