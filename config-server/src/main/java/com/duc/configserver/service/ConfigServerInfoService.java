package com.duc.configserver.service;

import com.duc.configserver.dto.response.ConfigServerInfoResponse;
import com.duc.configserver.entity.ConfigRepositoryInfo;
import com.duc.configserver.mapper.ConfigServerMapper;
import com.duc.configserver.repository.ConfigRepositoryInfoRepository;
import org.springframework.stereotype.Service;

@Service
public class ConfigServerInfoService {
    private final ConfigRepositoryInfoRepository repository;
    private final ConfigServerMapper mapper;

    public ConfigServerInfoService(ConfigRepositoryInfoRepository repository, ConfigServerMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ConfigServerInfoResponse info() {
        ConfigRepositoryInfo info = repository.load();
        return mapper.toResponse(info);
    }
}
