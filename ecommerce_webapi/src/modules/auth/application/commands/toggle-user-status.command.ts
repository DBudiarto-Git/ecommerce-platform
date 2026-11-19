export class ToggleUserStatusCommand {
  constructor(
    public readonly targetUserId: number,
    public readonly isActive: boolean,
    public readonly adminUserId: number, // Verhindert, dass sich ein Admin selbst aussperrt
  ) {}
}
