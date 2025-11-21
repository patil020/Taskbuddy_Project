package com.taskbuddy.service;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.ProjectMemberDto;
import java.util.List;

public interface ProjectMemberService {
    List<ProjectMemberDto> getMembersForProject(Long projectId);
    List<ProjectMemberDto> getProjectsForUser(Long userId);
    void addMember(Long projectId, Long userId, Long managerId);
    ApiResponse<String> getUserRoleInProject(Long projectId, Long id);
}
