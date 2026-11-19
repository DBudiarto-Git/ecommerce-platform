import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Reset-Token fehlt' })
  token!: string;

  @IsString()
  @MinLength(8, { message: 'Das neue Passwort muss mindestens 8 Zeichen lang sein' })
  newPassword!: string;
}
