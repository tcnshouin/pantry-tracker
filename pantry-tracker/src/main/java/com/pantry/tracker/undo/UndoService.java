package com.pantry.tracker.undo;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Optional;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class UndoService {

    private static final int MAX_DEPTH = 50;

    private final Deque<UndoEntry> stack = new ArrayDeque<>();

    public void push(UndoEntry entry) {
        stack.push(entry);
        while (stack.size() > MAX_DEPTH) {
            stack.removeLast();
        }
    }

    public Optional<UndoEntry> pop() {
        return stack.isEmpty() ? Optional.empty() : Optional.of(stack.pop());
    }

    public Optional<String> peekLabel() {
        return Optional.ofNullable(stack.peek()).map(UndoEntry::label);
    }

    public boolean isEmpty() {
        return stack.isEmpty();
    }
}
