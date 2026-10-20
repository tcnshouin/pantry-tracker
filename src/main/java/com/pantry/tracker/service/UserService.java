package com.pantry.tracker.service;

import com.pantry.tracker.model.SupabaseUser;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public UUID currentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SupabaseUser user)) {
            throw new IllegalStateException("Not signed in");
        }
        return user.id();
    }
}
