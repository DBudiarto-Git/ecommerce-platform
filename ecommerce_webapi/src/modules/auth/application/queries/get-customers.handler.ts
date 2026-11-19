import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCustomersQuery } from './get-customers.query';
import { AUTH_READ_REPOSITORY_PORT } from '../../domain/repositories/auth-read.repository.port';
import type {
  IAuthReadRepositoryPort,
  UserReadModel,
} from '../../domain/repositories/auth-read.repository.port';

@QueryHandler(GetCustomersQuery)
export class GetCustomersHandler
  implements IQueryHandler<GetCustomersQuery, UserReadModel[]>
{
  constructor(
    @Inject(AUTH_READ_REPOSITORY_PORT)
    private readonly authReadRepo: IAuthReadRepositoryPort,
  ) {}

  async execute(query: GetCustomersQuery): Promise<UserReadModel[]> {
    return this.authReadRepo.findAllCustomers(query.filter);
  }
}
