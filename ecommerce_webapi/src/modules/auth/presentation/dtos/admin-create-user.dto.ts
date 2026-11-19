import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import type { AppRole } from '@shared/decorators/roles.decorator';

// const ALLOWED_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'PACKER', 'GUEST', 'CUSTOMER'];

export class AdminCreateUserDto {
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Bitte wähle eine Rolle aus' })
  roleName!: AppRole;

  @IsOptional()
  @IsBoolean({ message: 'isActive muss ein Boolean-Wert (true/false) sein' })
  isActive?: boolean;
}
