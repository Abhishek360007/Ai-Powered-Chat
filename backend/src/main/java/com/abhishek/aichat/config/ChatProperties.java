package com.abhishek.aichat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.chat")
public record ChatProperties(String systemPrompt, int memoryWindow) {

    public ChatProperties {
        if (memoryWindow <= 0) {
            memoryWindow = 20;
        }
    }
}
