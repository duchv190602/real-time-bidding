package com.duc.gateway.service;

import com.duc.gateway.dto.response.GatewayRouteResponse;
import com.duc.gateway.mapper.GatewayRouteMapper;
import com.duc.gateway.repository.RouteMetadataRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GatewayRouteService {
    private final RouteMetadataRepository routeMetadataRepository;
    private final GatewayRouteMapper gatewayRouteMapper;

    public GatewayRouteService(RouteMetadataRepository routeMetadataRepository, GatewayRouteMapper gatewayRouteMapper) {
        this.routeMetadataRepository = routeMetadataRepository;
        this.gatewayRouteMapper = gatewayRouteMapper;
    }

    public List<GatewayRouteResponse> routes() {
        return routeMetadataRepository.findAll().stream().map(gatewayRouteMapper::toResponse).toList();
    }
}
