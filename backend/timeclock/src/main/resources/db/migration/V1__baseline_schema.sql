CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sp_id BIGINT NOT NULL,
  pin VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_users_sp_id (sp_id),
  KEY idx_users_pin (pin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS linked_device (
  id BIGINT NOT NULL AUTO_INCREMENT,
  project_id BIGINT NULL,
  device_id VARCHAR(255) NOT NULL,
  updated_at DATETIME NULL,
  is_expired BIT(1) NULL,
  PRIMARY KEY (id),
  KEY idx_linked_device_project_id (project_id),
  KEY idx_linked_device_device_id (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS timeclock_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  action VARCHAR(255) NOT NULL,
  timestamp DATETIME(6) NOT NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_timeclock_events_user (user_id),
  KEY idx_timeclock_events_ts (timestamp),
  CONSTRAINT fk_timeclock_events_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS punched_user_link (
  id BIGINT NOT NULL AUTO_INCREMENT,
  punch_id BIGINT NULL,
  link_id BIGINT NULL,
  PRIMARY KEY (id),
  KEY idx_punched_user_link_punch (punch_id),
  KEY idx_punched_user_link_link (link_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
