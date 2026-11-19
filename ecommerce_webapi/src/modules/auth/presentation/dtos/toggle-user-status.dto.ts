import { IsBoolean } from 'class-validator';

export class ToggleUserStatusDto {
  @IsBoolean({ message: 'isActive muss true oder false sein' })
  isActive!: boolean;
}
