import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthRepository, User } from './auth.repository.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class AuthService {
  constructor(private repository: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const existingUser = await this.repository.findUserByEmail(input.email);
    if (existingUser) {
      throw AppError.conflict('Email already exists', ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.repository.createUser(input.email, input.name, passwordHash);

    const token = this.generateToken(user.id, user.email);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(input: LoginInput): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS);
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password_hash);
    if (!isValidPassword) {
      throw AppError.unauthorized('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS);
    }

    const token = this.generateToken(user.id, user.email);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }
}
