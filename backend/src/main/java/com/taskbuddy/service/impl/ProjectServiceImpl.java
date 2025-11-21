package com.taskbuddy.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import com.taskbuddy.repository.ProjectRepository;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.repository.ProjectMemberRepository;
import com.taskbuddy.entity.Project;
import com.taskbuddy.entity.User;
import com.taskbuddy.entity.ProjectMember;
import com.taskbuddy.dto.ProjectDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.enums.ProjectStatus;
import com.taskbuddy.enums.ProjectRole;
import com.taskbuddy.exception.ResourceNotFoundException;
import com.taskbuddy.exception.InvalidInputException;
import com.taskbuddy.service.ProjectService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ModelMapper mapper;

    @Override
    public ApiResponse<String> createProject(ProjectDto dto, Long requestingUserId) {
        User manager = userRepository.findById(requestingUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Manager (creator) not found!"));

        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setManager(manager);
        project.setStatus(ProjectStatus.PENDING);

        Project savedProject = projectRepository.save(project);

        ProjectMember managerMember = new ProjectMember();
        managerMember.setProject(savedProject);
        managerMember.setUser(manager);
        managerMember.setRole(ProjectRole.MANAGER);
        projectMemberRepository.save(managerMember);

        return new ApiResponse<>(true, "Project created successfully!", null);
    }

    @Override
    public ApiResponse<List<ProjectDto>> getAllProjects() {
        var projects = projectRepository.findAll();
        var projectDtos = projects.stream()
            .map(project -> {
                ProjectDto dto = mapper.map(project, ProjectDto.class);
                dto.setManagerName(project.getManager().getUsername());
                // NOTE: This may initialize lazy collections; acceptable for now (minimal change)
                dto.setTaskCount(project.getTasks() != null ? project.getTasks().size() : 0);
                dto.setMemberCount(project.getProjectMembers() != null ? project.getProjectMembers().size() : 0);
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "Projects retrieved successfully!", projectDtos);
    }

    @Override
    public ApiResponse<ProjectDto> getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        ProjectDto dto = mapper.map(project, ProjectDto.class);
        dto.setManagerName(project.getManager().getUsername());
        return new ApiResponse<>(true, "Project retrieved successfully!", dto);
    }

    @Override
    public ApiResponse<List<ProjectDto>> getProjectsByManager(Long managerId) {
        User manager = userRepository.findById(managerId)
            .orElseThrow(() -> new ResourceNotFoundException("Manager not found!"));

        var projects = projectRepository.findByManager(manager);
        var projectDtos = projects.stream()
            .map(project -> {
                ProjectDto dto = mapper.map(project, ProjectDto.class);
                dto.setManagerName(project.getManager().getUsername());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "Manager's projects retrieved successfully!", projectDtos);
    }

    @Override
    public ApiResponse<List<ProjectDto>> getProjectsByMember(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        var projectMembers = projectMemberRepository.findByUser(user);
        var projectDtos = projectMembers.stream()
            .map(member -> {
                ProjectDto dto = mapper.map(member.getProject(), ProjectDto.class);
                dto.setManagerName(member.getProject().getManager().getUsername());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "User's projects retrieved successfully!", projectDtos);
    }

    @Override
    public ApiResponse<String> updateProject(Long projectId, ProjectDto dto, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        boolean isProjectManager = projectMemberRepository.findByProjectIdAndUserId(projectId, requestingUserId)
            .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
            .orElse(false);
        if (!isProjectManager) {
            throw new InvalidInputException("Only project manager can update project details!");
        }

        if (dto.getName() != null) {
            project.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            try {
                ProjectStatus status = ProjectStatus.valueOf(dto.getStatus().toUpperCase());
                project.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new InvalidInputException("Invalid project status: " + dto.getStatus());
            }
        }

        projectRepository.save(project);
        return new ApiResponse<>(true, "Project updated successfully!", null);
    }

    @Override
    public ApiResponse<String> deleteProject(Long projectId, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        boolean isProjectManager = projectMemberRepository.findByProjectIdAndUserId(projectId, requestingUserId)
            .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
            .orElse(false);
        if (!isProjectManager) {
            throw new InvalidInputException("Only project manager can delete the project!");
        }

        projectMemberRepository.deleteByProject(project);
        projectRepository.delete(project);
        return new ApiResponse<>(true, "Project deleted successfully!", null);
    }

    @Override
    public ApiResponse<String> addMemberToProject(Long projectId, Long userId, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        User userToAdd = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        boolean isProjectManager = projectMemberRepository.findByProjectIdAndUserId(projectId, requestingUserId)
            .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
            .orElse(false);
        if (!isProjectManager) {
            throw new InvalidInputException("Only project manager can add members!");
        }

        boolean isAlreadyMember = projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent();
        if (isAlreadyMember) {
            throw new InvalidInputException("User is already a member of this project!");
        }

        ProjectMember newMember = new ProjectMember();
        newMember.setProject(project);
        newMember.setUser(userToAdd);
        newMember.setRole(ProjectRole.MEMBER);
        projectMemberRepository.save(newMember);

        return new ApiResponse<>(true, "Member added to project successfully!", null);
    }

    @Override
    public ApiResponse<String> removeMemberFromProject(Long projectId, Long userId, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        User userToRemove = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        boolean isProjectManager = projectMemberRepository.findByProjectIdAndUserId(projectId, requestingUserId)
            .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
            .orElse(false);
        if (!isProjectManager) {
            throw new InvalidInputException("Only project manager can remove members!");
        }

        if (project.getManager().getId().equals(userId)) {
            throw new InvalidInputException("Project manager cannot be removed from the project!");
        }

        ProjectMember memberToRemove = projectMemberRepository.findByProjectAndUser(project, userToRemove)
            .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this project!"));

        projectMemberRepository.delete(memberToRemove);
        return new ApiResponse<>(true, "Member removed from project successfully!", null);
    }

    @Override
    public ApiResponse<String> updateProjectStatus(Long projectId, ProjectStatus status, Long requestingUserId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        boolean isProjectManager = projectMemberRepository.findByProjectIdAndUserId(projectId, requestingUserId)
            .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
            .orElse(false);
        if (!isProjectManager) {
            throw new InvalidInputException("Only project manager can update project status!");
        }

        project.setStatus(status);
        projectRepository.save(project);
        return new ApiResponse<>(true, "Project status updated successfully!", null);
    }

    @Override
    public ApiResponse<List<ProjectDto>> getProjectsByUserId(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        List<Project> managedProjects = projectRepository.findByManager(user);
        List<ProjectMember> memberProjects = projectMemberRepository.findByUser(user);

        List<Project> allProjects = managedProjects.stream().collect(Collectors.toList());
        memberProjects.stream()
            .map(ProjectMember::getProject)
            .filter(p -> !allProjects.contains(p))
            .forEach(allProjects::add);

        List<ProjectDto> projectDtos = allProjects.stream()
            .map(project -> {
                ProjectDto dto = mapper.map(project, ProjectDto.class);
                dto.setManagerName(project.getManager().getUsername());
                // NOTE: same as above—minimal change
                dto.setTaskCount(project.getTasks() != null ? project.getTasks().size() : 0);
                dto.setMemberCount(project.getProjectMembers() != null ? project.getProjectMembers().size() : 0);
                return dto;
            })
            .collect(Collectors.toList());

        return new ApiResponse<>(true, "Projects retrieved successfully!", projectDtos);
    }

    @Override
    public ApiResponse<String> assignMemberToProject(Long projectId, Long userId, Long requestingUserId) {
        return addMemberToProject(projectId, userId, requestingUserId);
    }
}
