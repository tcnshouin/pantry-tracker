package com.pantry.tracker.service;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginAttemptService {

    public static final int MAX_FAILURES = 3;
    public static final Duration LOCK_DURATION = Duration.ofHours(24);

    private final JdbcTemplate jdbc;

    public LoginAttemptService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record Failure(int attemptsLeft, Instant lockedUntil) {
        public boolean locked() {
            return lockedUntil != null;
        }
    }

    public Optional<Instant> lockedUntil(String email, String ip) {
        return lockedUntil(email, ip, Instant.now());
    }

    @Transactional(readOnly = true)
    public Optional<Instant> lockedUntil(String email, String ip, Instant now) {
        List<Timestamp> rows = jdbc.queryForList(
                "select locked_until from login_attempt where email = ? and ip = ? and locked_until > ?",
                Timestamp.class, email, ip, Timestamp.from(now));
        return rows.stream().findFirst().map(Timestamp::toInstant);
    }

    public Failure recordFailure(String email, String ip) {
        return recordFailure(email, ip, Instant.now());
    }

    @Transactional
    public Failure recordFailure(String email, String ip, Instant now) {
        Timestamp at = Timestamp.from(now);
        Integer count = jdbc.queryForObject("""
                insert into login_attempt (email, ip, failed_count, last_failed_at)
                values (?, ?, 1, ?)
                on conflict (email, ip) do update set
                    failed_count = case
                        when login_attempt.last_failed_at < ? then 1
                        else login_attempt.failed_count + 1
                    end,
                    last_failed_at = excluded.last_failed_at,
                    locked_until = null
                returning failed_count
                """, Integer.class, email, ip, at, Timestamp.from(now.minus(LOCK_DURATION)));
        int failures = count == null ? 1 : count;
        if (failures < MAX_FAILURES) {
            return new Failure(MAX_FAILURES - failures, null);
        }
        Instant until = now.plus(LOCK_DURATION);
        jdbc.update("update login_attempt set failed_count = 0, locked_until = ? where email = ? and ip = ?",
                Timestamp.from(until), email, ip);
        return new Failure(0, until);
    }

    @Transactional
    public void clear(String email, String ip) {
        jdbc.update("delete from login_attempt where email = ? and ip = ?", email, ip);
    }

    @Transactional
    public void clearEmail(String email) {
        jdbc.update("delete from login_attempt where email = ?", email);
    }

    @Scheduled(cron = "0 15 3 * * *")
    public void runDailyCleanup() {
        cleanup(Instant.now());
    }

    @Transactional
    public int cleanup(Instant now) {
        Timestamp at = Timestamp.from(now);
        return jdbc.update("""
                delete from login_attempt
                where (locked_until is null or locked_until <= ?) and last_failed_at < ?
                """, at, Timestamp.from(now.minus(LOCK_DURATION)));
    }
}
