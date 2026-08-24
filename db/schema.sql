-- Himalayan Reserve — VIP Allocation schema
-- Server: MySQL 5.7.39 (Laragon) / compatible with MySQL 8.x
-- Database: himalayan_reserve

CREATE DATABASE IF NOT EXISTS himalayan_reserve
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE himalayan_reserve;

CREATE TABLE IF NOT EXISTS allocations (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(120)  NOT NULL,
  email        VARCHAR(190)  NOT NULL,
  phone        VARCHAR(60)   NOT NULL,
  country_city VARCHAR(120)  NOT NULL,
  inquiry_type VARCHAR(32)   NOT NULL
               COMMENT 'private_collection|royal_gifting|atmosphere_reservation',
  message      TEXT          NULL,
  channel      VARCHAR(20)   NOT NULL DEFAULT 'form'
               COMMENT 'form|whatsapp|mailto',
  status       VARCHAR(20)   NOT NULL DEFAULT 'new'
               COMMENT 'new|contacted|allocated|declined',
  ip           VARCHAR(45)   NULL,
  user_agent   VARCHAR(255)  NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email  (email),
  KEY idx_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- Admin & content management
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(60)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'admin'
                COMMENT 'admin|editor',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Failed admin login attempts, for brute-force lockout (see auth.php).
-- Rows older than the lockout window are pruned on every login attempt.
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip           VARCHAR(45)  NOT NULL,
  username     VARCHAR(60)  NOT NULL,
  attempted_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ip_time (ip, attempted_at)
) ENGINE=InnoDB;

-- site_settings: one row per editable section ('seo', 'hero', 'stats',
-- 'ancestral', 'civet', 'craft', 'packaging', 'dubai', 'press', 'nav',
-- 'footer', 'media'). Value is a JSON document overriding content defaults.
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(80)  NOT NULL PRIMARY KEY,
  settings    JSON         NOT NULL,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Live chat: visitor accounts + conversations with the admin
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Same brute-force lockout pattern as admin login_attempts, kept as its own
-- table (rather than sharing one) so a customer-login attack can never
-- interact with admin lockout accounting.
CREATE TABLE IF NOT EXISTS customer_login_attempts (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip           VARCHAR(45)  NOT NULL,
  email        VARCHAR(190) NOT NULL,
  attempted_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ip_time (ip, attempted_at)
) ENGINE=InnoDB;

-- One conversation per customer (kept simple — a single ongoing thread with
-- the site, like the "request" thread in a ride-hailing app, not a
-- multi-topic inbox).
CREATE TABLE IF NOT EXISTS conversations (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  status            VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT 'open|closed',
  last_message_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_unread   INT UNSIGNED NOT NULL DEFAULT 0,
  admin_unread      INT UNSIGNED NOT NULL DEFAULT 0,
  created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conversations_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  KEY idx_last_message (last_message_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender          VARCHAR(10) NOT NULL COMMENT 'customer|admin',
  body            TEXT        NOT NULL,
  created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  KEY idx_conversation_time (conversation_id, created_at)
) ENGINE=InnoDB;