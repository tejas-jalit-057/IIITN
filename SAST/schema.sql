-- ============================================================
-- SAST – Signal Anomaly and Security Tracking
-- MySQL Database Schema + Seed Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS sast_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sast_db;

-- ─── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(64)  NOT NULL UNIQUE,
    email         VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,          -- PHP password_hash() / bcrypt
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── 2. SESSIONS (Bearer-token based) ────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── 3. TRAFFIC REQUESTS (5-min time-series buckets) ─────────
CREATE TABLE IF NOT EXISTS traffic_requests (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    bucket_ts TIMESTAMP NOT NULL,
    requests  INT NOT NULL DEFAULT 0,
    success   INT NOT NULL DEFAULT 0,
    failures  INT NOT NULL DEFAULT 0,
    rps       FLOAT NOT NULL DEFAULT 0,
    INDEX idx_ts (bucket_ts)
) ENGINE=InnoDB;

-- ─── 4. DEVICE BREAKDOWN ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_breakdown (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    date    DATE NOT NULL,
    mobile  INT NOT NULL DEFAULT 0,
    desktop INT NOT NULL DEFAULT 0,
    tablet  INT NOT NULL DEFAULT 0,
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ─── 5. BROWSER STATS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS browser_stats (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    date    DATE NOT NULL,
    browser VARCHAR(64) NOT NULL,
    visits  INT NOT NULL DEFAULT 0,
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ─── 6. PROTOCOL STATS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS protocol_stats (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    date     DATE NOT NULL,
    protocol VARCHAR(16) NOT NULL,   -- HTTP | HTTPS | HTTP2 | HTTP3
    requests INT NOT NULL DEFAULT 0,
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ─── 7. MOBILE OS STATS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS mobile_os_stats (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    date    DATE NOT NULL,
    os_name VARCHAR(64) NOT NULL,
    visits  INT NOT NULL DEFAULT 0,
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ─── 8. SECURITY ATTACKS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS security_attacks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    bucket_ts   TIMESTAMP NOT NULL,
    layer       ENUM('application','network') NOT NULL,
    attack_type VARCHAR(64) NOT NULL,
    count       INT NOT NULL DEFAULT 0,
    INDEX idx_ts_layer (bucket_ts, layer)
) ENGINE=InnoDB;

-- ─── 9. CONNECTIVITY / SPEED TESTS ───────────────────────────
CREATE TABLE IF NOT EXISTS connectivity_tests (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    tested_at     TIMESTAMP NOT NULL,
    download_mbps FLOAT NOT NULL DEFAULT 0,
    upload_mbps   FLOAT NOT NULL DEFAULT 0,
    latency_ms    INT NOT NULL DEFAULT 0,
    iqi_score     FLOAT NOT NULL DEFAULT 0,
    region        VARCHAR(64) NOT NULL DEFAULT 'Global',
    INDEX idx_ts (tested_at)
) ENGINE=InnoDB;

-- ─── 10. BOT TRAFFIC ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bot_traffic (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    date      DATE NOT NULL,
    bot_name  VARCHAR(64) NOT NULL,
    requests  INT NOT NULL DEFAULT 0,
    is_ai_bot TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================
-- NOTE: Replace password hashes with real bcrypt output from:
--       php -r "echo password_hash('password123', PASSWORD_BCRYPT);"

INSERT INTO users (username, email, password_hash) VALUES
('admin',   'admin@sast.io',   '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01'),
('analyst', 'analyst@sast.io', '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01');

INSERT INTO device_breakdown (date, mobile, desktop, tablet) VALUES
('2026-01-30', 42000, 73000, 5200),
('2026-01-31', 44500, 71000, 5500),
('2026-02-01', 39800, 68000, 4900);

INSERT INTO browser_stats (date, browser, visits) VALUES
('2026-02-01','Chrome',52000),('2026-02-01','Safari',21000),
('2026-02-01','Firefox',12000),('2026-02-01','Edge',8500),
('2026-02-01','Opera',3200),('2026-02-01','Other',2100);

INSERT INTO protocol_stats (date, protocol, requests) VALUES
('2026-02-01','HTTP',4800),('2026-02-01','HTTPS',61000),
('2026-02-01','HTTP2',28500),('2026-02-01','HTTP3',14200);

INSERT INTO mobile_os_stats (date, os_name, visits) VALUES
('2026-02-01','iOS',24000),('2026-02-01','Android',34000),
('2026-02-01','Windows Mobile',2100),('2026-02-01','Other',1800);

INSERT INTO bot_traffic (date, bot_name, requests, is_ai_bot) VALUES
('2026-02-01','Googlebot',18000,0),
('2026-02-01','GPT-4o / OpenAI',9200,1),
('2026-02-01','ChatGPT-User',7400,1),
('2026-02-01','Bingbot',5100,0),
('2026-02-01','Claude / Anthropic',4300,1),
('2026-02-01','Perplexity AI',3800,1),
('2026-02-01','Yandex',2100,0),
('2026-02-01','DuckDuckBot',1500,0);

INSERT INTO connectivity_tests (tested_at, download_mbps, upload_mbps, latency_ms, iqi_score, region) VALUES
('2026-02-01 08:00:00',142.5,48.2,22,87.4,'Asia-Pacific'),
('2026-02-01 10:00:00',155.0,52.1,18,91.2,'Europe'),
('2026-02-01 12:00:00',138.2,45.9,25,85.1,'North America'),
('2026-02-01 14:00:00',161.3,55.0,15,93.8,'Global');
