package com.tasky.project.dto;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

@ValidUpdateProject
public class UpdateProjectRequest {

    private String name;

    private boolean namePresent;

    private String emoji;

    private boolean emojiPresent;

    public void setName(String name) {
        this.name = name;
        this.namePresent = true;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
        this.emojiPresent = true;
    }

    public String name() {
        return name;
    }

    public boolean namePresent() {
        return namePresent;
    }

    public String emoji() {
        return emoji;
    }

    public boolean emojiPresent() {
        return emojiPresent;
    }
}

@java.lang.annotation.Target(java.lang.annotation.ElementType.TYPE)
@java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidUpdateProject.Validator.class)
@interface ValidUpdateProject {

    String message() default "Validation failed";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validator implements ConstraintValidator<ValidUpdateProject, UpdateProjectRequest> {

        @Override
        public boolean isValid(UpdateProjectRequest request, ConstraintValidatorContext context) {
            if (request == null) {
                return true;
            }
            context.disableDefaultConstraintViolation();
            boolean valid = true;
            if (request.namePresent()) {
                String name = request.name();
                if (name == null || name.isEmpty()) {
                    context.buildConstraintViolationWithTemplate("Name is required")
                        .addPropertyNode("name")
                        .addConstraintViolation();
                    valid = false;
                } else if (name.length() > 100) {
                    context.buildConstraintViolationWithTemplate("Name too long")
                        .addPropertyNode("name")
                        .addConstraintViolation();
                    valid = false;
                }
            }
            if (request.emojiPresent() && request.emoji() == null) {
                context.buildConstraintViolationWithTemplate("Expected string, received null")
                    .addPropertyNode("emoji")
                    .addConstraintViolation();
                valid = false;
            }
            return valid;
        }
    }
}
