package com.abhishek.aichat.service;

import com.abhishek.aichat.dto.ChatChunk;
import com.abhishek.aichat.dto.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.UUID;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final String STREAM_ERROR =
            "The AI service is unavailable right now. Please try again in a moment.";

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;

    public ChatService(ChatClient chatClient, ChatMemory chatMemory) {
        this.chatClient = chatClient;
        this.chatMemory = chatMemory;
    }

    public ChatResponse chat(String message, String conversationId) {
        String id = resolveConversationId(conversationId);
        String reply = chatClient.prompt()
                .user(message)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, id))
                .call()
                .content();
        return new ChatResponse(id, reply, Instant.now());
    }

    public Flux<ChatChunk> stream(String message, String conversationId) {
        String id = resolveConversationId(conversationId);
        return chatClient.prompt()
                .user(message)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, id))
                .stream()
                .content()
                .map(token -> ChatChunk.token(id, token))
                .concatWithValues(ChatChunk.end(id))
                .onErrorResume(ex -> {
                    log.error("Streaming chat failed for conversation {}", id, ex);
                    return Flux.just(ChatChunk.failure(id, STREAM_ERROR));
                });
    }

    public void clear(String conversationId) {
        chatMemory.clear(conversationId);
    }

    private static String resolveConversationId(String conversationId) {
        return StringUtils.hasText(conversationId) ? conversationId : UUID.randomUUID().toString();
    }
}
