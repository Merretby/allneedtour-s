import { UsersRepository, User } from './users.repository.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { calculatePagination, createPaginatedResult, PaginationParams } from '../../common/utils/pagination.js';

export class UsersService {
  constructor(private repository: UsersRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }
    return user;
  }

  async getUsers(params: PaginationParams) {
    const { page, limit, offset } = calculatePagination(params);
    const { users, total } = await this.repository.findAll(limit, offset);
    return createPaginatedResult(users, total, page, limit);
  }

  async updateUser(id: string, data: { name?: string; email?: string }): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }
    return this.repository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }
    await this.repository.delete(id);
  }
}
