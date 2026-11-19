export interface IPasswordHasherPort {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER_PORT = Symbol('PASSWORD_HASHER_PORT');
