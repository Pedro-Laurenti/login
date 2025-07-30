-- Script to clean up expired tokens
-- Run this periodically using system cron or manually

SELECT cleanup_expired_tokens();

-- To check how many tokens were cleaned up, you can run:
-- SELECT 
--     (SELECT COUNT(*) FROM access_tokens WHERE expires_at < NOW()) as expired_access_tokens,
--     (SELECT COUNT(*) FROM password_reset_tokens WHERE expires_at < NOW()) as expired_reset_tokens,
--     (SELECT COUNT(*) FROM email_verification_tokens WHERE expires_at < NOW()) as expired_verification_tokens;
