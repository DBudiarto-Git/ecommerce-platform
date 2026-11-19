export interface JwtPayload {
  sub: number;      // Die postgresUserId
  email: string;
  role: string;     // z. B. 'ADMIN', 'CUSTOMER'
}

export interface ITokenServicePort {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
}

export const TOKEN_SERVICE_PORT = Symbol('TOKEN_SERVICE_PORT');
