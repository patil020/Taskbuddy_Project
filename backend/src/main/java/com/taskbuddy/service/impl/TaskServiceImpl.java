package com.taskbuddy.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import com.taskbuddy.repository.TaskRepository;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.repository.ProjectRepository;
import com.taskbuddy.repository.ProjectMemberRepository;
import com.taskbuddy.entity.Task;
import com.taskbuddy.entity.User;
import com.taskbuddy.entity.Project;
import com.taskbuddy.dto.TaskDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.enums.TaskPriority;
import com.taskbuddy.enums.TaskStatus;
import com.taskbuddy.exception.ResourceNotFoundException;
import com.taskbuddy.exception.InvalidInputException;
import com.taskbuddy.service.TaskService;
import com.taskbuddy.service.NotificationService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;

    @Override
    public ApiResponse<String> createTask(TaskDto taskDto, Long requestingUserId) {
        Project project = projectRepository.findById(taskDto.getProjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        boolean isManager = project.getManager().getId().equals(requestingUserId);
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(project.getId(), requestingUserId);
        if (!isManager && !isMember) {
            throw new InvalidInputException("Only project manager or project members can create tasks!");
        }

        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setPriority(taskDto.getPriority() != null ? taskDto.getPriority() : TaskPriority.MEDIUM);
        task.setProject(project);
        task.setStatus(TaskStatus.PENDING);
        if (taskDto.getDueDate() != null) {
            task.setDueDate(taskDto.getDueDate());
        }

        boolean assigned = false;
        if (taskDto.getAssignedUserId() != null) {
            User assignedUser = userRepository.findById(taskDto.getAssignedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found!"));

            boolean isAssignedUserMember =
                projectMemberRepository.existsByProjectIdAndUserId(project.getId(), assignedUser.getId());
            if (!isAssignedUserMember) {
                throw new InvalidInputException("Cannot assign task to user who is not a project member!");
            }

            task.setAssignedUser(assignedUser);
            assigned = true;

            notificationService.notifyTaskAssigned(
                assignedUser.getId(),
                task.getTitle(),
                project.getName()
            );
        }

        taskRepository.save(task);
        String msg = assigned ? "Task created and assigned successfully!" : "Task created successfully!";
        return new ApiResponse<>(true, msg, null);
    }

    @Override
    public ApiResponse<String> updateTaskStatus(Long taskId, TaskStatus status, Long requestingUserId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));

        if (task.getAssignedUser() == null) {
            throw new InvalidInputException("Task is not assigned to any user!");
        }
        if (!task.getAssignedUser().getId().equals(requestingUserId)) {
            throw new InvalidInputException("Only assigned user can change task status!");
        }

        task.setStatus(status);
        taskRepository.save(task);

        notificationService.notifyTaskStatusChanged(
            task.getProject().getManager().getId(),
            task.getTitle(),
            status.toString()
        );

        String pretty = status.name().replace('_', ' ').toLowerCase();
        return new ApiResponse<>(true, "Task " + pretty + " successfully!", null);
    }

    @Override
    public ApiResponse<String> reassignTask(Long taskId, Long newAssigneeId, Long requestingUserId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));

        if (!task.getProject().getManager().getId().equals(requestingUserId)) {
            throw new InvalidInputException("Only project manager can reassign tasks!");
        }

        User newAssignee = userRepository.findById(newAssigneeId)
            .orElseThrow(() -> new ResourceNotFoundException("New assignee not found!"));

        boolean isMember =
            projectMemberRepository.existsByProjectIdAndUserId(task.getProject().getId(), newAssignee.getId());
        if (!isMember) {
            throw new InvalidInputException("Cannot assign task to user who is not a project member!");
        }

        task.setAssignedUser(newAssignee);
        task.setStatus(TaskStatus.PENDING); // reset upon reassignment
        taskRepository.save(task);

        notificationService.notifyTaskAssigned(
            newAssignee.getId(),
            task.getTitle(),
            task.getProject().getName()
        );

        return new ApiResponse<>(true, "Task reassigned successfully!", null);
    }

    @Override
    public ApiResponse<List<TaskDto>> getAllTasks() {
        var tasks = taskRepository.findAll();
        var taskDtos = tasks.stream()
            .map(task -> {
                TaskDto dto = modelMapper.map(task, TaskDto.class);
                dto.setAssignedUserId(task.getAssignedUser() != null ? task.getAssignedUser().getId() : null);
                dto.setAssignedUserName(task.getAssignedUser() != null ? task.getAssignedUser().getUsername() : null);
                dto.setProjectName(task.getProject().getName());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "Tasks retrieved successfully!", taskDtos);
    }

    @Override
    public ApiResponse<TaskDto> getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));

        TaskDto dto = modelMapper.map(task, TaskDto.class);
        dto.setAssignedUserId(task.getAssignedUser() != null ? task.getAssignedUser().getId() : null);
        dto.setAssignedUserName(task.getAssignedUser() != null ? task.getAssignedUser().getUsername() : null);
        dto.setProjectName(task.getProject().getName());
        return new ApiResponse<>(true, "Task retrieved successfully!", dto);
    }

    @Override
    public ApiResponse<List<TaskDto>> getTasksByProjectId(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        var tasks = taskRepository.findByProject(project);
        var taskDtos = tasks.stream()
            .map(task -> {
                TaskDto dto = modelMapper.map(task, TaskDto.class);
                dto.setAssignedUserId(task.getAssignedUser() != null ? task.getAssignedUser().getId() : null);
                dto.setAssignedUserName(task.getAssignedUser() != null ? task.getAssignedUser().getUsername() : null);
                dto.setProjectName(task.getProject().getName());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "Project tasks retrieved successfully!", taskDtos);
    }

    @Override
    public ApiResponse<String> updateTask(Long taskId, TaskDto taskDto, Long requestingUserId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));

        boolean isManager = task.getProject().getManager().getId().equals(requestingUserId);
        boolean isAssignee = task.getAssignedUser() != null &&
                             task.getAssignedUser().getId().equals(requestingUserId);
        if (!isManager && !isAssignee) {
            throw new InvalidInputException("Only project manager or assigned user can update this task!");
        }

        if (taskDto.getTitle() != null) task.setTitle(taskDto.getTitle());
        if (taskDto.getDescription() != null) task.setDescription(taskDto.getDescription());
        if (taskDto.getPriority() != null) task.setPriority(taskDto.getPriority());
        if (taskDto.getDueDate() != null) task.setDueDate(taskDto.getDueDate());

        taskRepository.save(task);
        return new ApiResponse<>(true, "Task updated successfully!", null);
    }

    @Override
    public ApiResponse<String> deleteTask(Long taskId, Long requestingUserId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));

        if (!task.getProject().getManager().getId().equals(requestingUserId)) {
            throw new InvalidInputException("Only project manager can delete tasks!");
        }

        taskRepository.deleteById(taskId);
        return new ApiResponse<>(true, "Task deleted successfully!", null);
    }
}
