package com.taskbuddy.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import com.taskbuddy.repository.ProjectMemberRepository;
import com.taskbuddy.repository.ProjectRepository;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.entity.ProjectMember;
import com.taskbuddy.entity.Project;
import com.taskbuddy.entity.User;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.ProjectMemberDto;
import com.taskbuddy.service.ProjectMemberService;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ProjectMemberServiceImpl implements ProjectMemberService {
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public List<ProjectMemberDto> getMembersForProject(Long projectId) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return members.stream().map(this::mapToDto).toList();
    }

    @Override
    public List<ProjectMemberDto> getProjectsForUser(Long userId) {
        List<ProjectMember> memberships = projectMemberRepository.findByUserId(userId);
        return memberships.stream().map(this::mapToDto).toList();
    }
    
    private ProjectMemberDto mapToDto(ProjectMember member) {
        ProjectMemberDto dto = new ProjectMemberDto();
        dto.setId(member.getId());
        dto.setProjectId(member.getProject().getId());
        dto.setUserId(member.getUser().getId());
        dto.setRole(member.getRole());
        
        // Project details
        dto.setProjectName(member.getProject().getName());
        dto.setProjectDescription(member.getProject().getDescription());
        dto.setProjectStatus(member.getProject().getStatus() != null ? member.getProject().getStatus().toString() : "ACTIVE");
        
        // User details
        dto.setUserName(member.getUser().getUsername());
        dto.setUserEmail(member.getUser().getEmail());
        
        return dto;
    }

    @Override
    public void addMember(Long projectId, Long userId, Long managerId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Check if the user is already a member of the project
        if (projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent()) {
            // User is already a member, so no action is needed.
            return;
        }

        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(project);
        projectMember.setUser(user);
        projectMember.setRole(com.taskbuddy.enums.ProjectRole.MEMBER);

        projectMemberRepository.save(projectMember);
    }

    @Override
    public ApiResponse<String> getUserRoleInProject(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
            .map(member -> new ApiResponse<>(true, "Role retrieved successfully!", member.getRole().name()))
            .orElse(new ApiResponse<>(false, "User is not a member of this project", null));
    }
}
