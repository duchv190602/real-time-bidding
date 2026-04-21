package com.duc.gateway.controller;

import com.duc.common.dto.response.ApiResponse;
import com.duc.gateway.dto.response.GatewayRouteResponse;
import com.duc.gateway.service.GatewayRouteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gateway")
public class GatewayController {
    private final GatewayRouteService gatewayRouteService;

    public GatewayController(GatewayRouteService gatewayRouteService) {
        this.gatewayRouteService = gatewayRouteService;
    }

    @GetMapping("/routes")
    public ApiResponse<List<GatewayRouteResponse>> routes() {
        return ApiResponse.ok(gatewayRouteService.routes());
    }
}

