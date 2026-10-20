package com.pantry.tracker.model;

import java.io.Serializable;
import java.security.Principal;
import java.util.UUID;

public record SupabaseUser(UUID id, String email) implements Principal, Serializable {

    @Override
    public String getName() {
        return email;
    }
}
