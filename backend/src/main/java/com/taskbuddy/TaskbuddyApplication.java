
package com.taskbuddy;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TaskbuddyApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskbuddyApplication.class, args);
    }
    @Bean
    public ModelMapper modelMapper() {
		System.out.println("in model mapper creation");
		ModelMapper mapper = new ModelMapper();
		mapper.getConfiguration()
				/*
				 * To tell ModelMapper to map only those props whose names match in src n dest.
				 * objects
				 */
				.setMatchingStrategy(MatchingStrategies.STRICT)
				/*
				 * To tell ModelMapper not to transfer nulls from src -> dest
				 */
				.setPropertyCondition(Conditions.isNotNull());// use case - PUT
		return mapper;
    }
}