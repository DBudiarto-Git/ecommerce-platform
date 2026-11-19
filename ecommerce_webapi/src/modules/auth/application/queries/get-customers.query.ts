import { FindUsersFilter } from '../../domain/repositories/auth-read.repository.port';

export class GetCustomersQuery {
  constructor(public readonly filter: FindUsersFilter) {}
}
