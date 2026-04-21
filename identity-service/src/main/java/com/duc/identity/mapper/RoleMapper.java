package com.duc.identity.mapper;

import com.duc.identity.dto.request.RoleRequest;
import com.duc.identity.dto.response.RoleResponse;
import com.duc.identity.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
