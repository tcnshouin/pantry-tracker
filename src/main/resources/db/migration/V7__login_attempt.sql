create table login_attempt (
    email          varchar(320) not null,
    ip             varchar(45)  not null,
    failed_count   integer      not null default 0,
    last_failed_at timestamptz  not null,
    locked_until   timestamptz,
    primary key (email, ip)
);

create index idx_login_attempt_last_failed on login_attempt (last_failed_at);

alter table login_attempt enable row level security;
