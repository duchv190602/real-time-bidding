package com.duc.configserver.repository;

import com.duc.configserver.entity.ConfigRepositoryInfo;
import org.springframework.stereotype.Repository;

@Repository
public class ConfigRepositoryInfoRepository {
    public ConfigRepositoryInfo load() {
        return new ConfigRepositoryInfo("native", "local file system");
    }
}
