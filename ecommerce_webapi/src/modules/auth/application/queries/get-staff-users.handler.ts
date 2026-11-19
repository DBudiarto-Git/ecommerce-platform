import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetStaffUsersQuery } from './get-staff-users.query';
import { AUTH_READ_REPOSITORY_PORT } from '../../domain/repositories/auth-read.repository.port';
import type {
  IAuthReadRepositoryPort,
  UserReadModel,
} from '../../domain/repositories/auth-read.repository.port';

@QueryHandler(GetStaffUsersQuery)
export class GetStaffUsersHandler
  implements IQueryHandler<GetStaffUsersQuery, UserReadModel[]>
{
  constructor(
    @Inject(AUTH_READ_REPOSITORY_PORT)
    private readonly authReadRepo: IAuthReadRepositoryPort,
  ) {}

  async execute(query: GetStaffUsersQuery): Promise<UserReadModel[]> {
    return this.authReadRepo.findAllStaff(query.filter);
  }
}
