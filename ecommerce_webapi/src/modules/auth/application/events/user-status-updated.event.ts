export class UserStatusUpdatedEvent {
  constructor(
    public readonly postgresUserId: number,
    public readonly isActive: boolean,
  ) {}
}
