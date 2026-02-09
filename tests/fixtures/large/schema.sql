-- Large SQL schema file for E2E testing
-- PostgreSQL-compatible DDL

-- Table: users_0
CREATE TABLE users_0 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_0_email ON users_0(email);
CREATE INDEX idx_users_0_username ON users_0(username);

CREATE VIEW active_users_0 AS
    SELECT id, username, email, first_name, last_name
    FROM users_0
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_0(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_0 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_1
CREATE TABLE users_1 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_1_email ON users_1(email);
CREATE INDEX idx_users_1_username ON users_1(username);

CREATE VIEW active_users_1 AS
    SELECT id, username, email, first_name, last_name
    FROM users_1
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_1(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_1 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_2
CREATE TABLE users_2 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_2_email ON users_2(email);
CREATE INDEX idx_users_2_username ON users_2(username);

CREATE VIEW active_users_2 AS
    SELECT id, username, email, first_name, last_name
    FROM users_2
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_2(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_2 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_3
CREATE TABLE users_3 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_3_email ON users_3(email);
CREATE INDEX idx_users_3_username ON users_3(username);

CREATE VIEW active_users_3 AS
    SELECT id, username, email, first_name, last_name
    FROM users_3
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_3(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_3 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_4
CREATE TABLE users_4 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_4_email ON users_4(email);
CREATE INDEX idx_users_4_username ON users_4(username);

CREATE VIEW active_users_4 AS
    SELECT id, username, email, first_name, last_name
    FROM users_4
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_4(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_4 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_5
CREATE TABLE users_5 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_5_email ON users_5(email);
CREATE INDEX idx_users_5_username ON users_5(username);

CREATE VIEW active_users_5 AS
    SELECT id, username, email, first_name, last_name
    FROM users_5
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_5(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_5 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_6
CREATE TABLE users_6 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_6_email ON users_6(email);
CREATE INDEX idx_users_6_username ON users_6(username);

CREATE VIEW active_users_6 AS
    SELECT id, username, email, first_name, last_name
    FROM users_6
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_6(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_6 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_7
CREATE TABLE users_7 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_7_email ON users_7(email);
CREATE INDEX idx_users_7_username ON users_7(username);

CREATE VIEW active_users_7 AS
    SELECT id, username, email, first_name, last_name
    FROM users_7
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_7(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_7 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_8
CREATE TABLE users_8 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_8_email ON users_8(email);
CREATE INDEX idx_users_8_username ON users_8(username);

CREATE VIEW active_users_8 AS
    SELECT id, username, email, first_name, last_name
    FROM users_8
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_8(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_8 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_9
CREATE TABLE users_9 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_9_email ON users_9(email);
CREATE INDEX idx_users_9_username ON users_9(username);

CREATE VIEW active_users_9 AS
    SELECT id, username, email, first_name, last_name
    FROM users_9
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_9(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_9 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_10
CREATE TABLE users_10 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_10_email ON users_10(email);
CREATE INDEX idx_users_10_username ON users_10(username);

CREATE VIEW active_users_10 AS
    SELECT id, username, email, first_name, last_name
    FROM users_10
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_10(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_10 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_11
CREATE TABLE users_11 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_11_email ON users_11(email);
CREATE INDEX idx_users_11_username ON users_11(username);

CREATE VIEW active_users_11 AS
    SELECT id, username, email, first_name, last_name
    FROM users_11
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_11(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_11 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_12
CREATE TABLE users_12 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_12_email ON users_12(email);
CREATE INDEX idx_users_12_username ON users_12(username);

CREATE VIEW active_users_12 AS
    SELECT id, username, email, first_name, last_name
    FROM users_12
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_12(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_12 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_13
CREATE TABLE users_13 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_13_email ON users_13(email);
CREATE INDEX idx_users_13_username ON users_13(username);

CREATE VIEW active_users_13 AS
    SELECT id, username, email, first_name, last_name
    FROM users_13
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_13(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_13 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_14
CREATE TABLE users_14 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_14_email ON users_14(email);
CREATE INDEX idx_users_14_username ON users_14(username);

CREATE VIEW active_users_14 AS
    SELECT id, username, email, first_name, last_name
    FROM users_14
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_14(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_14 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_15
CREATE TABLE users_15 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_15_email ON users_15(email);
CREATE INDEX idx_users_15_username ON users_15(username);

CREATE VIEW active_users_15 AS
    SELECT id, username, email, first_name, last_name
    FROM users_15
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_15(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_15 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_16
CREATE TABLE users_16 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_16_email ON users_16(email);
CREATE INDEX idx_users_16_username ON users_16(username);

CREATE VIEW active_users_16 AS
    SELECT id, username, email, first_name, last_name
    FROM users_16
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_16(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_16 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_17
CREATE TABLE users_17 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_17_email ON users_17(email);
CREATE INDEX idx_users_17_username ON users_17(username);

CREATE VIEW active_users_17 AS
    SELECT id, username, email, first_name, last_name
    FROM users_17
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_17(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_17 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_18
CREATE TABLE users_18 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_18_email ON users_18(email);
CREATE INDEX idx_users_18_username ON users_18(username);

CREATE VIEW active_users_18 AS
    SELECT id, username, email, first_name, last_name
    FROM users_18
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_18(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_18 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_19
CREATE TABLE users_19 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_19_email ON users_19(email);
CREATE INDEX idx_users_19_username ON users_19(username);

CREATE VIEW active_users_19 AS
    SELECT id, username, email, first_name, last_name
    FROM users_19
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_19(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_19 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_20
CREATE TABLE users_20 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_20_email ON users_20(email);
CREATE INDEX idx_users_20_username ON users_20(username);

CREATE VIEW active_users_20 AS
    SELECT id, username, email, first_name, last_name
    FROM users_20
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_20(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_20 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_21
CREATE TABLE users_21 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_21_email ON users_21(email);
CREATE INDEX idx_users_21_username ON users_21(username);

CREATE VIEW active_users_21 AS
    SELECT id, username, email, first_name, last_name
    FROM users_21
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_21(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_21 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_22
CREATE TABLE users_22 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_22_email ON users_22(email);
CREATE INDEX idx_users_22_username ON users_22(username);

CREATE VIEW active_users_22 AS
    SELECT id, username, email, first_name, last_name
    FROM users_22
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_22(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_22 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_23
CREATE TABLE users_23 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_23_email ON users_23(email);
CREATE INDEX idx_users_23_username ON users_23(username);

CREATE VIEW active_users_23 AS
    SELECT id, username, email, first_name, last_name
    FROM users_23
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_23(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_23 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_24
CREATE TABLE users_24 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_24_email ON users_24(email);
CREATE INDEX idx_users_24_username ON users_24(username);

CREATE VIEW active_users_24 AS
    SELECT id, username, email, first_name, last_name
    FROM users_24
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_24(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_24 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_25
CREATE TABLE users_25 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_25_email ON users_25(email);
CREATE INDEX idx_users_25_username ON users_25(username);

CREATE VIEW active_users_25 AS
    SELECT id, username, email, first_name, last_name
    FROM users_25
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_25(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_25 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_26
CREATE TABLE users_26 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_26_email ON users_26(email);
CREATE INDEX idx_users_26_username ON users_26(username);

CREATE VIEW active_users_26 AS
    SELECT id, username, email, first_name, last_name
    FROM users_26
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_26(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_26 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_27
CREATE TABLE users_27 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_27_email ON users_27(email);
CREATE INDEX idx_users_27_username ON users_27(username);

CREATE VIEW active_users_27 AS
    SELECT id, username, email, first_name, last_name
    FROM users_27
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_27(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_27 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_28
CREATE TABLE users_28 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_28_email ON users_28(email);
CREATE INDEX idx_users_28_username ON users_28(username);

CREATE VIEW active_users_28 AS
    SELECT id, username, email, first_name, last_name
    FROM users_28
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_28(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_28 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_29
CREATE TABLE users_29 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_29_email ON users_29(email);
CREATE INDEX idx_users_29_username ON users_29(username);

CREATE VIEW active_users_29 AS
    SELECT id, username, email, first_name, last_name
    FROM users_29
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_29(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_29 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_30
CREATE TABLE users_30 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_30_email ON users_30(email);
CREATE INDEX idx_users_30_username ON users_30(username);

CREATE VIEW active_users_30 AS
    SELECT id, username, email, first_name, last_name
    FROM users_30
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_30(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_30 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_31
CREATE TABLE users_31 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_31_email ON users_31(email);
CREATE INDEX idx_users_31_username ON users_31(username);

CREATE VIEW active_users_31 AS
    SELECT id, username, email, first_name, last_name
    FROM users_31
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_31(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_31 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_32
CREATE TABLE users_32 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_32_email ON users_32(email);
CREATE INDEX idx_users_32_username ON users_32(username);

CREATE VIEW active_users_32 AS
    SELECT id, username, email, first_name, last_name
    FROM users_32
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_32(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_32 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_33
CREATE TABLE users_33 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_33_email ON users_33(email);
CREATE INDEX idx_users_33_username ON users_33(username);

CREATE VIEW active_users_33 AS
    SELECT id, username, email, first_name, last_name
    FROM users_33
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_33(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_33 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_34
CREATE TABLE users_34 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_34_email ON users_34(email);
CREATE INDEX idx_users_34_username ON users_34(username);

CREATE VIEW active_users_34 AS
    SELECT id, username, email, first_name, last_name
    FROM users_34
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_34(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_34 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_35
CREATE TABLE users_35 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_35_email ON users_35(email);
CREATE INDEX idx_users_35_username ON users_35(username);

CREATE VIEW active_users_35 AS
    SELECT id, username, email, first_name, last_name
    FROM users_35
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_35(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_35 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_36
CREATE TABLE users_36 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_36_email ON users_36(email);
CREATE INDEX idx_users_36_username ON users_36(username);

CREATE VIEW active_users_36 AS
    SELECT id, username, email, first_name, last_name
    FROM users_36
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_36(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_36 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_37
CREATE TABLE users_37 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_37_email ON users_37(email);
CREATE INDEX idx_users_37_username ON users_37(username);

CREATE VIEW active_users_37 AS
    SELECT id, username, email, first_name, last_name
    FROM users_37
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_37(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_37 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_38
CREATE TABLE users_38 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_38_email ON users_38(email);
CREATE INDEX idx_users_38_username ON users_38(username);

CREATE VIEW active_users_38 AS
    SELECT id, username, email, first_name, last_name
    FROM users_38
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_38(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_38 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_39
CREATE TABLE users_39 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_39_email ON users_39(email);
CREATE INDEX idx_users_39_username ON users_39(username);

CREATE VIEW active_users_39 AS
    SELECT id, username, email, first_name, last_name
    FROM users_39
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_39(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_39 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_40
CREATE TABLE users_40 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_40_email ON users_40(email);
CREATE INDEX idx_users_40_username ON users_40(username);

CREATE VIEW active_users_40 AS
    SELECT id, username, email, first_name, last_name
    FROM users_40
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_40(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_40 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_41
CREATE TABLE users_41 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_41_email ON users_41(email);
CREATE INDEX idx_users_41_username ON users_41(username);

CREATE VIEW active_users_41 AS
    SELECT id, username, email, first_name, last_name
    FROM users_41
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_41(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_41 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_42
CREATE TABLE users_42 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_42_email ON users_42(email);
CREATE INDEX idx_users_42_username ON users_42(username);

CREATE VIEW active_users_42 AS
    SELECT id, username, email, first_name, last_name
    FROM users_42
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_42(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_42 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_43
CREATE TABLE users_43 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_43_email ON users_43(email);
CREATE INDEX idx_users_43_username ON users_43(username);

CREATE VIEW active_users_43 AS
    SELECT id, username, email, first_name, last_name
    FROM users_43
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_43(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_43 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_44
CREATE TABLE users_44 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_44_email ON users_44(email);
CREATE INDEX idx_users_44_username ON users_44(username);

CREATE VIEW active_users_44 AS
    SELECT id, username, email, first_name, last_name
    FROM users_44
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_44(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_44 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_45
CREATE TABLE users_45 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_45_email ON users_45(email);
CREATE INDEX idx_users_45_username ON users_45(username);

CREATE VIEW active_users_45 AS
    SELECT id, username, email, first_name, last_name
    FROM users_45
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_45(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_45 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_46
CREATE TABLE users_46 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_46_email ON users_46(email);
CREATE INDEX idx_users_46_username ON users_46(username);

CREATE VIEW active_users_46 AS
    SELECT id, username, email, first_name, last_name
    FROM users_46
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_46(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_46 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_47
CREATE TABLE users_47 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_47_email ON users_47(email);
CREATE INDEX idx_users_47_username ON users_47(username);

CREATE VIEW active_users_47 AS
    SELECT id, username, email, first_name, last_name
    FROM users_47
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_47(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_47 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_48
CREATE TABLE users_48 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_48_email ON users_48(email);
CREATE INDEX idx_users_48_username ON users_48(username);

CREATE VIEW active_users_48 AS
    SELECT id, username, email, first_name, last_name
    FROM users_48
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_48(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_48 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_49
CREATE TABLE users_49 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_49_email ON users_49(email);
CREATE INDEX idx_users_49_username ON users_49(username);

CREATE VIEW active_users_49 AS
    SELECT id, username, email, first_name, last_name
    FROM users_49
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_49(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_49 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_50
CREATE TABLE users_50 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_50_email ON users_50(email);
CREATE INDEX idx_users_50_username ON users_50(username);

CREATE VIEW active_users_50 AS
    SELECT id, username, email, first_name, last_name
    FROM users_50
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_50(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_50 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_51
CREATE TABLE users_51 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_51_email ON users_51(email);
CREATE INDEX idx_users_51_username ON users_51(username);

CREATE VIEW active_users_51 AS
    SELECT id, username, email, first_name, last_name
    FROM users_51
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_51(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_51 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_52
CREATE TABLE users_52 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_52_email ON users_52(email);
CREATE INDEX idx_users_52_username ON users_52(username);

CREATE VIEW active_users_52 AS
    SELECT id, username, email, first_name, last_name
    FROM users_52
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_52(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_52 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_53
CREATE TABLE users_53 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_53_email ON users_53(email);
CREATE INDEX idx_users_53_username ON users_53(username);

CREATE VIEW active_users_53 AS
    SELECT id, username, email, first_name, last_name
    FROM users_53
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_53(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_53 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_54
CREATE TABLE users_54 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_54_email ON users_54(email);
CREATE INDEX idx_users_54_username ON users_54(username);

CREATE VIEW active_users_54 AS
    SELECT id, username, email, first_name, last_name
    FROM users_54
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_54(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_54 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_55
CREATE TABLE users_55 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_55_email ON users_55(email);
CREATE INDEX idx_users_55_username ON users_55(username);

CREATE VIEW active_users_55 AS
    SELECT id, username, email, first_name, last_name
    FROM users_55
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_55(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_55 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_56
CREATE TABLE users_56 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_56_email ON users_56(email);
CREATE INDEX idx_users_56_username ON users_56(username);

CREATE VIEW active_users_56 AS
    SELECT id, username, email, first_name, last_name
    FROM users_56
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_56(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_56 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_57
CREATE TABLE users_57 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_57_email ON users_57(email);
CREATE INDEX idx_users_57_username ON users_57(username);

CREATE VIEW active_users_57 AS
    SELECT id, username, email, first_name, last_name
    FROM users_57
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_57(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_57 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_58
CREATE TABLE users_58 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_58_email ON users_58(email);
CREATE INDEX idx_users_58_username ON users_58(username);

CREATE VIEW active_users_58 AS
    SELECT id, username, email, first_name, last_name
    FROM users_58
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_58(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_58 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_59
CREATE TABLE users_59 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_59_email ON users_59(email);
CREATE INDEX idx_users_59_username ON users_59(username);

CREATE VIEW active_users_59 AS
    SELECT id, username, email, first_name, last_name
    FROM users_59
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_59(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_59 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_60
CREATE TABLE users_60 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_60_email ON users_60(email);
CREATE INDEX idx_users_60_username ON users_60(username);

CREATE VIEW active_users_60 AS
    SELECT id, username, email, first_name, last_name
    FROM users_60
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_60(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_60 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_61
CREATE TABLE users_61 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_61_email ON users_61(email);
CREATE INDEX idx_users_61_username ON users_61(username);

CREATE VIEW active_users_61 AS
    SELECT id, username, email, first_name, last_name
    FROM users_61
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_61(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_61 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_62
CREATE TABLE users_62 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_62_email ON users_62(email);
CREATE INDEX idx_users_62_username ON users_62(username);

CREATE VIEW active_users_62 AS
    SELECT id, username, email, first_name, last_name
    FROM users_62
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_62(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_62 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_63
CREATE TABLE users_63 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_63_email ON users_63(email);
CREATE INDEX idx_users_63_username ON users_63(username);

CREATE VIEW active_users_63 AS
    SELECT id, username, email, first_name, last_name
    FROM users_63
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_63(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_63 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_64
CREATE TABLE users_64 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_64_email ON users_64(email);
CREATE INDEX idx_users_64_username ON users_64(username);

CREATE VIEW active_users_64 AS
    SELECT id, username, email, first_name, last_name
    FROM users_64
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_64(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_64 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_65
CREATE TABLE users_65 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_65_email ON users_65(email);
CREATE INDEX idx_users_65_username ON users_65(username);

CREATE VIEW active_users_65 AS
    SELECT id, username, email, first_name, last_name
    FROM users_65
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_65(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_65 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_66
CREATE TABLE users_66 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_66_email ON users_66(email);
CREATE INDEX idx_users_66_username ON users_66(username);

CREATE VIEW active_users_66 AS
    SELECT id, username, email, first_name, last_name
    FROM users_66
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_66(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_66 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_67
CREATE TABLE users_67 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_67_email ON users_67(email);
CREATE INDEX idx_users_67_username ON users_67(username);

CREATE VIEW active_users_67 AS
    SELECT id, username, email, first_name, last_name
    FROM users_67
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_67(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_67 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_68
CREATE TABLE users_68 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_68_email ON users_68(email);
CREATE INDEX idx_users_68_username ON users_68(username);

CREATE VIEW active_users_68 AS
    SELECT id, username, email, first_name, last_name
    FROM users_68
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_68(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_68 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_69
CREATE TABLE users_69 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_69_email ON users_69(email);
CREATE INDEX idx_users_69_username ON users_69(username);

CREATE VIEW active_users_69 AS
    SELECT id, username, email, first_name, last_name
    FROM users_69
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_69(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_69 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_70
CREATE TABLE users_70 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_70_email ON users_70(email);
CREATE INDEX idx_users_70_username ON users_70(username);

CREATE VIEW active_users_70 AS
    SELECT id, username, email, first_name, last_name
    FROM users_70
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_70(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_70 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_71
CREATE TABLE users_71 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_71_email ON users_71(email);
CREATE INDEX idx_users_71_username ON users_71(username);

CREATE VIEW active_users_71 AS
    SELECT id, username, email, first_name, last_name
    FROM users_71
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_71(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_71 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_72
CREATE TABLE users_72 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_72_email ON users_72(email);
CREATE INDEX idx_users_72_username ON users_72(username);

CREATE VIEW active_users_72 AS
    SELECT id, username, email, first_name, last_name
    FROM users_72
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_72(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_72 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_73
CREATE TABLE users_73 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_73_email ON users_73(email);
CREATE INDEX idx_users_73_username ON users_73(username);

CREATE VIEW active_users_73 AS
    SELECT id, username, email, first_name, last_name
    FROM users_73
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_73(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_73 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_74
CREATE TABLE users_74 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_74_email ON users_74(email);
CREATE INDEX idx_users_74_username ON users_74(username);

CREATE VIEW active_users_74 AS
    SELECT id, username, email, first_name, last_name
    FROM users_74
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_74(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_74 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_75
CREATE TABLE users_75 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_75_email ON users_75(email);
CREATE INDEX idx_users_75_username ON users_75(username);

CREATE VIEW active_users_75 AS
    SELECT id, username, email, first_name, last_name
    FROM users_75
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_75(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_75 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_76
CREATE TABLE users_76 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_76_email ON users_76(email);
CREATE INDEX idx_users_76_username ON users_76(username);

CREATE VIEW active_users_76 AS
    SELECT id, username, email, first_name, last_name
    FROM users_76
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_76(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_76 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_77
CREATE TABLE users_77 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_77_email ON users_77(email);
CREATE INDEX idx_users_77_username ON users_77(username);

CREATE VIEW active_users_77 AS
    SELECT id, username, email, first_name, last_name
    FROM users_77
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_77(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_77 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_78
CREATE TABLE users_78 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_78_email ON users_78(email);
CREATE INDEX idx_users_78_username ON users_78(username);

CREATE VIEW active_users_78 AS
    SELECT id, username, email, first_name, last_name
    FROM users_78
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_78(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_78 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_79
CREATE TABLE users_79 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_79_email ON users_79(email);
CREATE INDEX idx_users_79_username ON users_79(username);

CREATE VIEW active_users_79 AS
    SELECT id, username, email, first_name, last_name
    FROM users_79
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_79(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_79 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_80
CREATE TABLE users_80 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_80_email ON users_80(email);
CREATE INDEX idx_users_80_username ON users_80(username);

CREATE VIEW active_users_80 AS
    SELECT id, username, email, first_name, last_name
    FROM users_80
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_80(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_80 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_81
CREATE TABLE users_81 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_81_email ON users_81(email);
CREATE INDEX idx_users_81_username ON users_81(username);

CREATE VIEW active_users_81 AS
    SELECT id, username, email, first_name, last_name
    FROM users_81
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_81(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_81 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_82
CREATE TABLE users_82 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_82_email ON users_82(email);
CREATE INDEX idx_users_82_username ON users_82(username);

CREATE VIEW active_users_82 AS
    SELECT id, username, email, first_name, last_name
    FROM users_82
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_82(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_82 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_83
CREATE TABLE users_83 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_83_email ON users_83(email);
CREATE INDEX idx_users_83_username ON users_83(username);

CREATE VIEW active_users_83 AS
    SELECT id, username, email, first_name, last_name
    FROM users_83
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_83(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_83 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_84
CREATE TABLE users_84 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_84_email ON users_84(email);
CREATE INDEX idx_users_84_username ON users_84(username);

CREATE VIEW active_users_84 AS
    SELECT id, username, email, first_name, last_name
    FROM users_84
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_84(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_84 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_85
CREATE TABLE users_85 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_85_email ON users_85(email);
CREATE INDEX idx_users_85_username ON users_85(username);

CREATE VIEW active_users_85 AS
    SELECT id, username, email, first_name, last_name
    FROM users_85
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_85(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_85 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_86
CREATE TABLE users_86 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_86_email ON users_86(email);
CREATE INDEX idx_users_86_username ON users_86(username);

CREATE VIEW active_users_86 AS
    SELECT id, username, email, first_name, last_name
    FROM users_86
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_86(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_86 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_87
CREATE TABLE users_87 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_87_email ON users_87(email);
CREATE INDEX idx_users_87_username ON users_87(username);

CREATE VIEW active_users_87 AS
    SELECT id, username, email, first_name, last_name
    FROM users_87
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_87(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_87 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_88
CREATE TABLE users_88 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_88_email ON users_88(email);
CREATE INDEX idx_users_88_username ON users_88(username);

CREATE VIEW active_users_88 AS
    SELECT id, username, email, first_name, last_name
    FROM users_88
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_88(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_88 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_89
CREATE TABLE users_89 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_89_email ON users_89(email);
CREATE INDEX idx_users_89_username ON users_89(username);

CREATE VIEW active_users_89 AS
    SELECT id, username, email, first_name, last_name
    FROM users_89
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_89(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_89 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_90
CREATE TABLE users_90 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_90_email ON users_90(email);
CREATE INDEX idx_users_90_username ON users_90(username);

CREATE VIEW active_users_90 AS
    SELECT id, username, email, first_name, last_name
    FROM users_90
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_90(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_90 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_91
CREATE TABLE users_91 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_91_email ON users_91(email);
CREATE INDEX idx_users_91_username ON users_91(username);

CREATE VIEW active_users_91 AS
    SELECT id, username, email, first_name, last_name
    FROM users_91
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_91(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_91 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_92
CREATE TABLE users_92 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_92_email ON users_92(email);
CREATE INDEX idx_users_92_username ON users_92(username);

CREATE VIEW active_users_92 AS
    SELECT id, username, email, first_name, last_name
    FROM users_92
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_92(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_92 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_93
CREATE TABLE users_93 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_93_email ON users_93(email);
CREATE INDEX idx_users_93_username ON users_93(username);

CREATE VIEW active_users_93 AS
    SELECT id, username, email, first_name, last_name
    FROM users_93
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_93(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_93 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_94
CREATE TABLE users_94 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_94_email ON users_94(email);
CREATE INDEX idx_users_94_username ON users_94(username);

CREATE VIEW active_users_94 AS
    SELECT id, username, email, first_name, last_name
    FROM users_94
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_94(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_94 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_95
CREATE TABLE users_95 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_95_email ON users_95(email);
CREATE INDEX idx_users_95_username ON users_95(username);

CREATE VIEW active_users_95 AS
    SELECT id, username, email, first_name, last_name
    FROM users_95
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_95(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_95 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_96
CREATE TABLE users_96 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_96_email ON users_96(email);
CREATE INDEX idx_users_96_username ON users_96(username);

CREATE VIEW active_users_96 AS
    SELECT id, username, email, first_name, last_name
    FROM users_96
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_96(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_96 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_97
CREATE TABLE users_97 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_97_email ON users_97(email);
CREATE INDEX idx_users_97_username ON users_97(username);

CREATE VIEW active_users_97 AS
    SELECT id, username, email, first_name, last_name
    FROM users_97
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_97(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_97 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_98
CREATE TABLE users_98 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_98_email ON users_98(email);
CREATE INDEX idx_users_98_username ON users_98(username);

CREATE VIEW active_users_98 AS
    SELECT id, username, email, first_name, last_name
    FROM users_98
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_98(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_98 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Table: users_99
CREATE TABLE users_99 (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_99_email ON users_99(email);
CREATE INDEX idx_users_99_username ON users_99(username);

CREATE VIEW active_users_99 AS
    SELECT id, username, email, first_name, last_name
    FROM users_99
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_user_99(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT u.id, u.username, u.email FROM users_99 u WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;
