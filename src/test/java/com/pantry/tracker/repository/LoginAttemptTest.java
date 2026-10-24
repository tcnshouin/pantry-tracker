package com.pantry.tracker.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pantry.tracker.service.LoginAttemptService;
import com.pantry.tracker.service.LoginAttemptService.Failure;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

@DataJpaTest
@EnabledIf("com.pantry.tracker.SupabaseAvailable#configured")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(LoginAttemptService.class)
class LoginAttemptTest {

    private static final String IP = "203.0.113.5";
    private static final String OTHER_IP = "198.51.100.9";

    @Autowired
    private LoginAttemptService attempts;

    @Autowired
    private JdbcTemplate jdbc;

    private final Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);

    private static String email() {
        return "lockout-" + UUID.randomUUID() + "@example.com";
    }

    @Test
    void thirdFailureLocksThePairForADay() {
        String email = email();

        Failure first = attempts.recordFailure(email, IP, now);
        Failure second = attempts.recordFailure(email, IP, now.plusSeconds(10));
        Failure third = attempts.recordFailure(email, IP, now.plusSeconds(20));

        assertThat(first.attemptsLeft()).isEqualTo(2);
        assertThat(second.attemptsLeft()).isEqualTo(1);
        assertThat(third.locked()).isTrue();
        assertThat(third.lockedUntil()).isEqualTo(now.plusSeconds(20).plus(Duration.ofHours(24)));
        assertThat(attempts.lockedUntil(email, IP, now.plus(Duration.ofHours(23)))).isPresent();
        assertThat(attempts.lockedUntil(email, IP, now.plus(Duration.ofHours(25)))).isEmpty();
    }

    @Test
    void lockOnlyAppliesToThatNetwork() {
        String email = email();
        for (int i = 0; i < 3; i++) {
            attempts.recordFailure(email, IP, now.plusSeconds(i));
        }

        assertThat(attempts.lockedUntil(email, IP, now.plusSeconds(5))).isPresent();
        assertThat(attempts.lockedUntil(email, OTHER_IP, now.plusSeconds(5))).isEmpty();
        assertThat(attempts.recordFailure(email, OTHER_IP, now.plusSeconds(6)).attemptsLeft()).isEqualTo(2);
    }

    @Test
    void failuresOlderThanADayStartOver() {
        String email = email();
        attempts.recordFailure(email, IP, now);
        attempts.recordFailure(email, IP, now.plusSeconds(10));

        Failure later = attempts.recordFailure(email, IP, now.plus(Duration.ofHours(25)));

        assertThat(later.locked()).isFalse();
        assertThat(later.attemptsLeft()).isEqualTo(2);
    }

    @Test
    void countStartsOverOnceALockEnds() {
        String email = email();
        for (int i = 0; i < 3; i++) {
            attempts.recordFailure(email, IP, now.plusSeconds(i));
        }

        Failure afterLock = attempts.recordFailure(email, IP, now.plus(Duration.ofHours(25)));

        assertThat(afterLock.attemptsLeft()).isEqualTo(2);
        assertThat(attempts.lockedUntil(email, IP, now.plus(Duration.ofHours(25)))).isEmpty();
    }

    @Test
    void successClearsThePairAndResetClearsEveryNetwork() {
        String email = email();
        attempts.recordFailure(email, IP, now);
        attempts.recordFailure(email, IP, now.plusSeconds(1));
        attempts.clear(email, IP);
        assertThat(attempts.recordFailure(email, IP, now.plusSeconds(2)).attemptsLeft()).isEqualTo(2);

        for (int i = 0; i < 3; i++) {
            attempts.recordFailure(email, OTHER_IP, now.plusSeconds(10 + i));
        }
        attempts.clearEmail(email);

        assertThat(attempts.lockedUntil(email, OTHER_IP, now.plusSeconds(20))).isEmpty();
        assertThat(attempts.recordFailure(email, IP, now.plusSeconds(21)).attemptsLeft()).isEqualTo(2);
    }

    @Test
    void cleanupKeepsActiveLocksAndRecentFailures() {
        String locked = email();
        String recent = email();
        String stale = email();
        for (int i = 0; i < 3; i++) {
            attempts.recordFailure(locked, IP, now.plusSeconds(i));
        }
        attempts.recordFailure(recent, IP, now.plus(Duration.ofHours(20)));
        attempts.recordFailure(stale, IP, now);

        attempts.cleanup(now.plus(Duration.ofHours(25)));

        assertThat(rows(locked)).isEqualTo(0);
        assertThat(rows(recent)).isEqualTo(1);
        assertThat(rows(stale)).isEqualTo(0);
    }

    @Test
    void cleanupNeverRemovesALockThatIsStillRunning() {
        String locked = email();
        for (int i = 0; i < 3; i++) {
            attempts.recordFailure(locked, IP, now.plusSeconds(i));
        }

        attempts.cleanup(now.plus(Duration.ofHours(23)));

        assertThat(rows(locked)).isEqualTo(1);
        assertThat(attempts.lockedUntil(locked, IP, now.plus(Duration.ofHours(23)))).isPresent();
    }

    private int rows(String email) {
        Integer count = jdbc.queryForObject("select count(*) from login_attempt where email = ?", Integer.class, email);
        return count == null ? 0 : count;
    }
}
