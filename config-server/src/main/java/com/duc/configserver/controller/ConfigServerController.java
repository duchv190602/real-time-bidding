package com.duc.configserver.controller;

import com.duc.common.dto.response.ApiResponse;
import com.duc.configserver.dto.response.ConfigServerInfoResponse;
import com.duc.configserver.service.ConfigServerInfoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/config")
public class ConfigServerController {
    private final ConfigServerInfoService configServerInfoService;

    public ConfigServerController(ConfigServerInfoService configServerInfoService) {
        this.configServerInfoService = configServerInfoService;
    }

    @GetMapping("/info")
    public ApiResponse<ConfigServerInfoResponse> info() {
        return ApiResponse.ok(configServerInfoService.info());
    }
}
