import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Patch, 
  Param, 
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '@shared/decorators/public.decorator';
import { Roles } from '@shared/decorators/roles.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import type { JwtPayload } from '@shared/security/token-service.port';
import { RegisterCustomerDto } from '../dtos/register-customer.dto';
import { AdminCreateUserDto } from '../dtos/admin-create-user.dto';
import { LoginDto } from '../dtos/login.dto';
import { UpdateCustomerProfileDto } from '../dtos/update-customer-profile.dto';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { LoginUserCommand } from '../../application/commands/login-user.command';
import { UpsertCustomerProfileCommand } from '../../application/commands/upsert-customer-profile.command';
import { GetUserProfileQuery } from '../../application/queries/get-user-profile.query';
import { ToggleUserStatusDto } from '../dtos/toggle-user-status.dto';
import { ToggleUserStatusCommand } from '@modules/auth/application/commands/toggle-user-status.command';
import { FilterCustomersQueryDto, FilterStaffQueryDto } from '../dtos/filter-users.dto';
import { GetCustomersQuery } from '@modules/auth/application/queries/get-customers.query';
import { GetStaffUsersQuery } from '@modules/auth/application/queries/get-staff-users.query';
import { GetRolesQuery } from '@modules/auth/application/queries/get-roles.query';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ChangePasswordCommand } from '@modules/auth/application/commands/change-password.command';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ForgotPasswordCommand } from '@modules/auth/application/commands/forgot-password.command';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { ResetPasswordCommand } from '@modules/auth/application/commands/reset-password.command';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * 1. Öffentliche Registrierung (Astro-Storefront -> Rolle fix 'CUSTOMER')
   */
  @Public()
  @Post('register')
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.commandBus.execute(
      new RegisterUserCommand(dto.email, dto.password, dto.name, 'CUSTOMER'),
    );
  }

  /**
   * 2. Benutzer-Anlage im Admin-Dashboard (Rolle über Selectbox wählbar)
   */
  @Roles('ADMIN')
  @Post('admin/users')
  async createUserByAdmin(@Body() dto: AdminCreateUserDto) {
    return this.commandBus.execute(
      new RegisterUserCommand(dto.email, undefined, dto.name, dto.roleName, dto.isActive ?? true),
    );
  }

  /**
   * 3. Login für Storefront & Admin-Dashboard
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.commandBus.execute(
      new LoginUserCommand(dto.email, dto.password),
    );
  }

  /**
   * 4. Eigenes Profil abrufen (Liest aus Redis-Cache oder MongoDB)
   */
  @Get('profile')
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(new GetUserProfileQuery(user.sub));
  }

  /**
   * 5. Kundenprofil pflegen (Nur für Rolle CUSTOMER -> Schreibt nach Postgres & invalidiert Cache)
   */
  @Roles('CUSTOMER')
  @Put('profile/customer')
  async updateCustomerProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.commandBus.execute(
      new UpsertCustomerProfileCommand(user.sub, dto),
    );
  }

  /**
   * 6. Benutzer im Admin-Dashboard aktivieren oder deaktivieren
   */
  @Roles('ADMIN')
  @Patch('admin/users/:id/status')
  async toggleUserStatus(
    @Param('id', ParseIntPipe) targetUserId: number,
    @Body() dto: ToggleUserStatusDto,
    @CurrentUser() adminUser: { sub: number },
  ) {
    return this.commandBus.execute(
      new ToggleUserStatusCommand(targetUserId, dto.isActive, adminUser.sub),
    );
  }

  /**
   * 7. Admin-Tabelle 1: Alle Kunden (Rolle CUSTOMER inkl. Profil) abrufen & filtern
   * Beispiel: GET /auth/admin/customers?isActive=true&search=Max
   */
  @Roles('ADMIN')
  @Get('admin/customers')
  async getAllCustomers(@Query() queryDto: FilterCustomersQueryDto) {
    return this.queryBus.execute(new GetCustomersQuery(queryDto));
  }

  /**
   * 8. Admin-Tabelle 2: Alle internen Benutzer (Rolle NICHT CUSTOMER) abrufen & filtern
   * Beispiel: GET /auth/admin/staff?roleName=MANAGER&isActive=true
   */
  @Roles('ADMIN')
  @Get('admin/staff')
  async getAllStaffUsers(@Query() queryDto: FilterStaffQueryDto) {
    return this.queryBus.execute(new GetStaffUsersQuery(queryDto));
  }

  @Public()
  @Get('roles')
  async getAvailableRoles() {
    return this.queryBus.execute(new GetRolesQuery());
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser('sub') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(
      new ChangePasswordCommand(userId, dto.currentPassword, dto.newPassword),
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.commandBus.execute(new ForgotPasswordCommand(dto.email));
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.commandBus.execute(new ResetPasswordCommand(dto.token, dto.newPassword));
  }
}
