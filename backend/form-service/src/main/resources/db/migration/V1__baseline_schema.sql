CREATE TABLE IF NOT EXISTS form (
  id BIGINT NOT NULL AUTO_INCREMENT,
  kilometer DOUBLE NULL,
  extra_cost DOUBLE NULL,
  extra_cost_description VARCHAR(255) NULL,
  break_minutes TIME NULL,
  end_time TIME NULL,
  start_time TIME NULL,
  service_provider_id BIGINT NULL,
  job_id BIGINT NULL,
  own_car BIT(1) NULL,
  created_date_time DATETIME NULL,
  form_status VARCHAR(50) NULL,
  PRIMARY KEY (id),
  KEY idx_form_job_sp (job_id, service_provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS form_files (
  id BIGINT NOT NULL,
  file_path VARCHAR(1000) NULL,
  KEY idx_form_files_id (id),
  CONSTRAINT fk_form_files_form FOREIGN KEY (id) REFERENCES form (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
