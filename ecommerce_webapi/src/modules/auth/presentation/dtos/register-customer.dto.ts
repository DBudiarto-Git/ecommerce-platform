import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Das Passwort muss mindestens 8 Zeichen lang sein' })
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
