package com.tasky;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TaskyApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskyApplication.class, args);
    }
}