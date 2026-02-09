-- Test SQL schema file

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);

CREATE VIEW active_users AS
    SELECT * FROM users WHERE created_at > NOW() - INTERVAL '30 days';

CREATE FUNCTION get_user_posts(user_id INTEGER)
RETURNS TABLE(id INTEGER, title VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.title FROM posts p WHERE p.user_id = $1;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

ALTER TABLE users ADD COLUMN updated_at TIMESTAMP;
