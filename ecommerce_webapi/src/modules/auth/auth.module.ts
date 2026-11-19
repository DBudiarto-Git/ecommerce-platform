import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { AUTH_WRITE_REPOSITORY_PORT } from './domain/repositories/auth-write.repository.port';
import { PostgresAuthWriteRepository } from './infrastructure/persistence/postgres-auth-write.repository';
import { AUTH_READ_REPOSITORY_PORT } from './domain/repositories/auth-read.repository.port';
import { MongodbAuthReadRepository } from './infrastructure/persistence/mongodb-auth-read.repository';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { LoginUserHandler } from './application/commands/login-user.handler';
import { UpsertCustomerProfileHandler } from './application/commands/upsert-customer-profile.handler';
import { ToggleUserStatusHandler } from './application/commands/toggle-user-status.handler'; // 1. Import prüfen
import { UserRegisteredHandler } from './application/events/user-registered.handler';
import { CustomerProfileUpdatedHandler } from './application/events/customer-profile-updated.handler';
import { UserStatusUpdatedHandler } from './application/events/user-status-updated.handler';       // 2. Import prüfen
import { GetUserProfileHandler } from './application/queries/get-user-profile.handler';
import { GetCustomersHandler } from './application/queries/get-customers.handler';
import { GetStaffUsersHandler } from './application/queries/get-staff-users.handler';
import { GetRolesHandler } from './application/queries/get-roles.handler';
import { ChangePasswordHandler } from './application/commands/change-password.handler';
import { ForgotPasswordHandler } from './application/commands/forgot-password.handler';
import { ResetPasswordHandler } from './application/commands/reset-password.handler';

const CommandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  UpsertCustomerProfileHandler,
  ToggleUserStatusHandler, 
  ChangePasswordHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];

const QueryHandlers = [
  GetUserProfileHandler,
  GetCustomersHandler,
  GetStaffUsersHandler,
  GetRolesHandler, // <-- NEU HINZUGEFÜGT
];

const EventHandlers = [
  UserRegisteredHandler,
  CustomerProfileUpdatedHandler,
  UserStatusUpdatedHandler, // <-- HIER REGISTRIEREN
];

@Module({
  controllers: [AuthController],
  providers: [
    // Port-zu-Adapter-Bindungen (Dependency Inversion)
    {
      provide: AUTH_WRITE_REPOSITORY_PORT,
      useClass: PostgresAuthWriteRepository,
    },
    {
      provide: AUTH_READ_REPOSITORY_PORT,
      useClass: MongodbAuthReadRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class AuthModule {}
