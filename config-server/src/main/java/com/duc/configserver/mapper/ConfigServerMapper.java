package com.duc.configserver.mapper;

import com.duc.configserver.dto.response.ConfigServerInfoResponse;
import com.duc.configserver.entity.ConfigRepositoryInfo;
import org.springframework.stereotype.Component;

@Component
public class ConfigServerMapper {
    public ConfigServerInfoResponse toResponse(ConfigRepositoryInfo entity) {
        return new ConfigServerInfoResponse(entity.backendType(), entity.description());
    }
}
