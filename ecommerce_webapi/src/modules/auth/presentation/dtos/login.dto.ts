import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Passwort darf nicht leer sein' })
  password!: string;
}
