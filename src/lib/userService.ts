import { query } from './db';
import { hashPassword, generateSecureToken, hashToken } from './auth';
import { sendEmail } from './emailService';

export interface User {
  id: number;
  email: string;
  name: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface AccessToken {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  last_used_at: Date;
  user_agent?: string;
  ip_address?: string;
}

export class UserService {
  // Create a new user
  static async createUser(userData: CreateUserData): Promise<User> {
    const { email, password, name } = userData;
    
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name, email_verified, created_at, updated_at`,
      [email, passwordHash, name]
    );

    return result.rows[0];
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, name, email_verified, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  // Get user by ID
  static async getUserById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT id, email, name, email_verified, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  // Get user with password hash (for authentication)
  static async getUserWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    const result = await query(
      'SELECT id, email, name, email_verified, created_at, updated_at, password_hash FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  // Update user email verification status
  static async verifyUserEmail(userId: number): Promise<void> {
    await query(
      'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  // Update user password
  static async updatePassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  }

  // Create access token
  static async createAccessToken(
    userId: number, 
    userAgent?: string, 
    ipAddress?: string
  ): Promise<string> {
    const token = generateSecureToken(64);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      `INSERT INTO access_tokens (user_id, token_hash, expires_at, user_agent, ip_address) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, expiresAt, userAgent, ipAddress]
    );

    return token;
  }

  // Verify access token
  static async verifyAccessToken(token: string): Promise<User | null> {
    const tokenHash = hashToken(token);
    
    const result = await query(
      `SELECT u.id, u.email, u.name, u.email_verified, u.created_at, u.updated_at
       FROM users u
       JOIN access_tokens at ON u.id = at.user_id
       WHERE at.token_hash = $1 AND at.expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length > 0) {
      // Update last used timestamp
      await query(
        'UPDATE access_tokens SET last_used_at = NOW() WHERE token_hash = $1',
        [tokenHash]
      );
      
      return result.rows[0];
    }

    return null;
  }

  // Revoke access token
  static async revokeAccessToken(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await query('DELETE FROM access_tokens WHERE token_hash = $1', [tokenHash]);
  }

  // Revoke all user tokens
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await query('DELETE FROM access_tokens WHERE user_id = $1', [userId]);
  }

  // Create password reset token
  static async createPasswordResetToken(userId: number): Promise<string> {
    const token = generateSecureToken(64);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    // Enviar e-mail de recuperação de senha
    const user = await this.getUserById(userId);
    if (user) {
      const resetUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: 'Recuperação de senha',
        html: `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px;">
              <h2 style="color: #2d7be5; margin-top: 0;">Recuperação de senha</h2>
              <p>Olá, <strong>${user.name}</strong>!</p>
              <p>Recebemos uma solicitação para redefinir sua senha. Para continuar, clique no botão abaixo:</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: #2d7be5; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir senha</a>
              </p>
              <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <small style="color: #888;">Este link expira em 1 hora.</small>
            </div>
          </div>
        `,
        text: `Olá, ${user.name}! Para redefinir sua senha, acesse: ${resetUrl}`
      });
    }

    return token;
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token: string): Promise<number | null> {
    const tokenHash = hashToken(token);
    
    const result = await query(
      `SELECT user_id FROM password_reset_tokens 
       WHERE token_hash = $1 AND expires_at > NOW() AND used = false`,
      [tokenHash]
    );

    return result.rows[0]?.user_id || null;
  }

  // Use password reset token
  static async usePasswordResetToken(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE token_hash = $1',
      [tokenHash]
    );
  }

  // Create email verification token
  static async createEmailVerificationToken(userId: number): Promise<string> {
    const token = generateSecureToken(64);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    // Enviar e-mail de verificação
    const user = await this.getUserById(userId);
    if (user) {
      const verifyUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: 'Verificação de e-mail',
        html: `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px;">
              <h2 style="color: #2d7be5; margin-top: 0;">Confirme seu e-mail</h2>
              <p>Olá, <strong>${user.name}</strong>!</p>
              <p>Para ativar sua conta, confirme seu e-mail clicando no botão abaixo:</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" style="background: #2d7be5; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">Verificar e-mail</a>
              </p>
              <p>Se você não criou uma conta, ignore este e-mail.</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <small style="color: #888;">Este link expira em 24 horas.</small>
            </div>
          </div>
        `,
        text: `Olá, ${user.name}! Para verificar seu e-mail, acesse: ${verifyUrl}`
      });
    }

    return token;
  }

  // Verify email verification token
  static async verifyEmailVerificationToken(token: string): Promise<number | null> {
    const tokenHash = hashToken(token);
    
    const result = await query(
      `SELECT user_id FROM email_verification_tokens 
       WHERE token_hash = $1 AND expires_at > NOW() AND used = false`,
      [tokenHash]
    );

    return result.rows[0]?.user_id || null;
  }

  // Use email verification token
  static async useEmailVerificationToken(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await query(
      'UPDATE email_verification_tokens SET used = true WHERE token_hash = $1',
      [tokenHash]
    );
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens(): Promise<void> {
    await query('SELECT cleanup_expired_tokens()');
  }
}
