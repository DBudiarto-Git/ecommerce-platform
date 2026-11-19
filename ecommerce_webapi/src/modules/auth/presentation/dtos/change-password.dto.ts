import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Aktuelles Passwort darf nicht leer sein' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'Das neue Passwort muss mindestens 8 Zeichen lang sein' })
  newPassword!: string;
}
