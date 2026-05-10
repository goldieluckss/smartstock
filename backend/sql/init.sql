CREATE DATABASE IF NOT EXISTS techno_mobile_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE techno_mobile_app;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(120) DEFAULT NULL,
  qr_code VARCHAR(64) NOT NULL,
  category VARCHAR(120) NOT NULL,
  unit VARCHAR(32) NOT NULL DEFAULT 'pcs',
  quantity INT NOT NULL DEFAULT 0,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  expiry_date DATE DEFAULT NULL,
  supplier VARCHAR(190) DEFAULT NULL,
  location VARCHAR(120) DEFAULT NULL,
  image MEDIUMTEXT,
  qr_scan_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_user (user_id),
  UNIQUE KEY uq_products_user_qr (user_id, qr_code),
  CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  movement_type ENUM('stock_in','stock_out','sold','return','adjustment') NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sm_user_created (user_id, created_at),
  KEY idx_sm_product (product_id),
  CONSTRAINT fk_sm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  plan VARCHAR(32) NOT NULL DEFAULT 'starter',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  started_at DATE DEFAULT NULL,
  ends_at DATE DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriptions_user (user_id),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_type ENUM('admin','user','system') NOT NULL DEFAULT 'system',
  actor_id INT UNSIGNED DEFAULT NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(64) DEFAULT NULL,
  target_id VARCHAR(64) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logs_created (created_at),
  KEY idx_logs_actor (actor_type, actor_id)
);

CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  company_name VARCHAR(190) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  message TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partnership_status (status),
  KEY idx_partnership_updated (updated_at),
  CONSTRAINT fk_partnership_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
