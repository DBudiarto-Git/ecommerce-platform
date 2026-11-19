import { AppRole } from '@shared/decorators/roles.decorator';

export interface UserProps {
  id?: number;
  email: string;
  name?: string | null;
  isActive?: boolean;
  password?: string; // Optional im Lesekontext, Pflicht beim Schreiben
  mustChangePassword: boolean;
  roleId: number;
  roleName?: AppRole;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
}

export class UserEntity {
  public readonly id?: number;
  public readonly email: string;
  public name?: string | null;
  public isActive: boolean;
  public password?: string;
  public mustChangePassword: boolean;
  public readonly roleId: number;
  public readonly roleName?: AppRole;
  public resetToken?: string | null;
  public resetTokenExpiry?: Date | null;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email.toLowerCase().trim(); // Fachliche Regel: E-Mails immer kleingeschrieben speichern
    this.name = props.name ?? null;
    this.isActive = props.isActive ?? true;
    this.password = props.password;
    this.mustChangePassword = props.mustChangePassword ?? false;
    this.roleId = props.roleId;
    this.roleName = props.roleName;
    this.resetToken = props.resetToken ?? null;
    this.resetTokenExpiry = props.resetTokenExpiry ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Fachliche Regel: Prüft, ob ein vorhandener Passwort-Reset-Token noch gültig ist.
   */
  public isResetTokenValid(token: string): boolean {
    if (!this.resetToken || !this.resetTokenExpiry) {
      return false;
    }
    const isMatch = this.resetToken === token;
    const isNotExpired = this.resetTokenExpiry.getTime() > Date.now();
    return isMatch && isNotExpired;
  }

  /**
   * Erzeugt eine sichere Repräsentation ohne Passwort-Hash für Antworten oder Events.
   */
  public toSafeProfile() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      mustChangePassword: this.mustChangePassword,
      isActive: this.isActive,
      roleId: this.roleId,
      roleName: this.roleName,
      createdAt: this.createdAt,
    };
  }
}
