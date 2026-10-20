package com.pantry.tracker;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public final class SupabaseAvailable {

    private SupabaseAvailable() {
    }

    public static boolean configured() {
        String fromEnv = System.getenv("DB_URL");
        if (fromEnv != null && !fromEnv.isBlank()) {
            return true;
        }
        Path file = Path.of(".env");
        if (!Files.exists(file)) {
            return false;
        }
        try {
            return Files.readAllLines(file).stream()
                    .map(String::trim)
                    .anyMatch(line -> line.startsWith("DB_URL=") && line.length() > "DB_URL=".length());
        } catch (IOException ex) {
            return false;
        }
    }
}
