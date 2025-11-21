package com.taskbuddy.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import com.taskbuddy.repository.CommentRepository;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.repository.TaskRepository;
import com.taskbuddy.repository.ProjectRepository;
import com.taskbuddy.entity.Comment;
import com.taskbuddy.entity.User;
import com.taskbuddy.entity.Task;
import com.taskbuddy.entity.Project;
import com.taskbuddy.dto.CommentDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.exception.ResourceNotFoundException;
import com.taskbuddy.exception.InvalidInputException;
import com.taskbuddy.service.CommentService;
import com.taskbuddy.service.NotificationService;
import com.taskbuddy.repository.ProjectMemberRepository;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CommentService interface
 * Contains business logic for comment management operations
 */
@Service
@Transactional
@AllArgsConstructor
public class CommentServiceImpl implements CommentService {
    
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public ApiResponse<CommentDto> addProjectComment(Long projectId, CommentDto dto, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));

        Comment comment = new Comment();
        comment.setMessage(dto.getContent() != null ? dto.getContent() : dto.getMessage());
        comment.setUser(user);
        comment.setProject(project);
        
        commentRepository.save(comment);
        
        // Notify project manager about new comment
        if (!project.getManager().getId().equals(userId)) {
            notificationService.notifyNewComment(
                project.getManager().getId(),
                project.getName(),
                user.getUsername()
            );
        }
        
        // Return the created comment with user info
        CommentDto responseDto = modelMapper.map(comment, CommentDto.class);
        responseDto.setAuthorName(user.getUsername());
        
        return new ApiResponse<>(true, "Comment added successfully!", responseDto);
    }

    @Override
    public ApiResponse<CommentDto> addTaskComment(Long taskId, CommentDto dto, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));

        Comment comment = new Comment();
        comment.setMessage(dto.getContent() != null ? dto.getContent() : dto.getMessage());
        comment.setUser(user);
        comment.setTask(task);
        
        commentRepository.save(comment);
        
        // Notify task assignee and project manager about new comment
        if (task.getAssignedUser() != null && !task.getAssignedUser().getId().equals(userId)) {
            notificationService.notifyNewComment(
                task.getAssignedUser().getId(),
                task.getTitle(),
                user.getUsername()
            );
        }
        if (!task.getProject().getManager().getId().equals(userId)) {
            notificationService.notifyNewComment(
                task.getProject().getManager().getId(),
                task.getTitle(),
                user.getUsername()
            );
        }
        
        // Return the created comment with user info
        CommentDto responseDto = modelMapper.map(comment, CommentDto.class);
        responseDto.setAuthorName(user.getUsername());
        
        return new ApiResponse<>(true, "Comment added successfully!", responseDto);
    }

    @Override
    public ApiResponse<List<CommentDto>> getTaskComments(Long taskId) {
        List<Comment> comments = commentRepository.findByTaskId(taskId);
        List<CommentDto> commentDtos = comments.stream()
            .map(c -> {
                CommentDto dto = modelMapper.map(c, CommentDto.class);
                dto.setAuthorName(c.getUser().getUsername());
                dto.setUserId(c.getUser().getId());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "Task comments retrieved successfully!", commentDtos);
    }

    @Override
    public ApiResponse<List<CommentDto>> getProjectComments(Long projectId) {
        List<Comment> comments = commentRepository.findByProjectId(projectId);
        List<CommentDto> commentDtos = comments.stream()
            .map(c -> {
                CommentDto dto = modelMapper.map(c, CommentDto.class);
                dto.setAuthorName(c.getUser().getUsername());
                dto.setUserId(c.getUser().getId());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "Project comments retrieved successfully!", commentDtos);
    }

    @Override
    public ApiResponse<String> updateComment(Long commentId, CommentDto dto, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found!"));
        
        // Check if the user owns this comment
        if (!comment.getUser().getId().equals(userId)) {
            throw new InvalidInputException("You can only edit your own comments!");
        }
        
        comment.setMessage(dto.getContent() != null ? dto.getContent() : dto.getMessage());
        commentRepository.save(comment);
        
        return new ApiResponse<>(true, "Comment updated successfully!", null);
    }

    @Override
    public ApiResponse<String> deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found!"));
        
        // Check if the user owns this comment
        if (!comment.getUser().getId().equals(userId)) {
            throw new InvalidInputException("You can only delete your own comments!");
        }
        
        commentRepository.delete(comment);
        return new ApiResponse<>(true, "Comment deleted successfully!", null);
    }

    @Override
    public ApiResponse<List<CommentDto>> getAllComments() {
        List<Comment> comments = commentRepository.findAll();
        List<CommentDto> commentDtos = comments.stream()
            .map(c -> {
                CommentDto dto = modelMapper.map(c, CommentDto.class);
                dto.setAuthorName(c.getUser().getUsername());
                dto.setUserId(c.getUser().getId());
                return dto;
            })
            .collect(Collectors.toList());
        return new ApiResponse<>(true, "All comments retrieved successfully!", commentDtos);
    }

    @Override
    public ApiResponse<String> addComment(CommentDto dto) {
        User user = userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        Comment comment = new Comment();
        comment.setMessage(dto.getMessage());
        comment.setUser(user);

        if (dto.getTaskId() != null) {
            Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found!"));
            comment.setTask(task);
        } else if (dto.getProjectId() != null) {
            Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found!"));
            comment.setProject(project);
        } else {
            throw new InvalidInputException("Comment must be associated with a task or a project!");
        }

        commentRepository.save(comment);
        return new ApiResponse<>(true, "Comment added!", null);
    }

    @Override
    public List<CommentDto> getCommentsForTask(Long taskId) {
        List<Comment> comments = commentRepository.findByTaskId(taskId);
        return comments.stream()
                .map(c -> modelMapper.map(c, CommentDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<CommentDto> getCommentsForProject(Long projectId) {
        List<Comment> comments = commentRepository.findByProjectId(projectId);
        return comments.stream()
                .map(c -> modelMapper.map(c, CommentDto.class))
                .collect(Collectors.toList());
    }
}
