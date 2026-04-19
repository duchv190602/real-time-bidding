package com.duc.gateway.mapper;

import com.duc.gateway.dto.response.GatewayRouteResponse;
import com.duc.gateway.entity.RouteMetadata;
import org.springframework.stereotype.Component;

@Component
public class GatewayRouteMapper {
    public GatewayRouteResponse toResponse(RouteMetadata metadata) {
        return new GatewayRouteResponse(metadata.serviceId(), metadata.pathPattern());
    }
}
