package com.taskbuddy.controller;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.ProjectDto;
import com.taskbuddy.dto.TaskDto;
import com.taskbuddy.entity.User;
import com.taskbuddy.service.ProjectService;
import com.taskbuddy.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final ProjectService projectService;
    private final TaskService taskService;

    @GetMapping("/summary")
    public Map<String,Object> summary(@AuthenticationPrincipal User user) {
        Long uid = user.getId();

        try {
            ApiResponse<List<ProjectDto>> projectsResponse = projectService.getProjectsByUserId(uid);
            ApiResponse<List<TaskDto>> tasksResponse = taskService.getAllTasks();
            
            int projects = projectsResponse.getData() != null ? projectsResponse.getData().size() : 0;
            int tasks = tasksResponse.getData() != null ? tasksResponse.getData().size() : 0;
            
            return Map.of(
                "projectsCount", projects,
                "myTasksCount", tasks,
                "totalProjects", projects,
                "totalTasks", tasks
            );
        } catch (Exception e) {
            return Map.of(
                "projectsCount", 0,
                "myTasksCount", 0,
                "totalProjects", 0,
                "totalTasks", 0
            );
        }
    }
}