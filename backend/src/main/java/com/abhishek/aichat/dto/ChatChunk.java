package com.abhishek.aichat.dto;

/** A single piece of a streamed reply, sent as one line of NDJSON. */
public record ChatChunk(String conversationId, String content, boolean done, String error) {

    public static ChatChunk token(String conversationId, String content) {
        return new ChatChunk(conversationId, content, false, null);
    }

    public static ChatChunk end(String conversationId) {
        return new ChatChunk(conversationId, "", true, null);
    }

    public static ChatChunk failure(String conversationId, String error) {
        return new ChatChunk(conversationId, "", true, error);
    }
}
