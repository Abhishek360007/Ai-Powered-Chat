package com.abhishek.aichat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "Message must not be empty")
        @Size(max = 4000, message = "Message must be at most 4000 characters")
        String message,

        @Size(max = 64, message = "Conversation id is too long")
        String conversationId) {
}
