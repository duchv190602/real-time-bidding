package com.duc.gateway.repository;

import com.duc.gateway.entity.RouteMetadata;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RouteMetadataRepository {
    public List<RouteMetadata> findAll() {
        return List.of(
                new RouteMetadata("identity-service", "/identity/**"),
                new RouteMetadata("auction-service", "/auction/**"),
                new RouteMetadata("bidding-service", "/bidding/**"),
                new RouteMetadata("notification-service", "/notification/**")
        );
    }
}

