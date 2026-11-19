import { FindStaffFilter } from '../../domain/repositories/auth-read.repository.port';

export class GetStaffUsersQuery {
  constructor(public readonly filter: FindStaffFilter) {}
}
