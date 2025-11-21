package com.taskbuddy.dto;

import lombok.*;
import com.taskbuddy.enums.ProjectRole;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDto {
    private Long id;
    private Long projectId;
    private Long userId;
    private ProjectRole role;
    
    // Project details
    private String projectName;
    private String projectDescription;
    private String projectStatus;
    
    // User details
    private String userName;
    private String userEmail;
}
