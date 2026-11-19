import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  email!: string;
}
