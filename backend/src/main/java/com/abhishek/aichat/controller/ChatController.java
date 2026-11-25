package com.abhishek.aichat.controller;

import com.abhishek.aichat.dto.ChatChunk;
import com.abhishek.aichat.dto.ChatRequest;
import com.abhishek.aichat.dto.ChatResponse;
import com.abhishek.aichat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /** Returns the full reply in a single JSON response. */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.chat(request.message(), request.conversationId());
    }

    /** Streams the reply token by token as newline-delimited JSON. */
    @PostMapping(value = "/stream", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<ChatChunk> stream(@Valid @RequestBody ChatRequest request) {
        return chatService.stream(request.message(), request.conversationId());
    }

    /** Forgets the history of a conversation. */
    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> clear(@PathVariable String conversationId) {
        chatService.clear(conversationId);
        return ResponseEntity.noContent().build();
    }
}
