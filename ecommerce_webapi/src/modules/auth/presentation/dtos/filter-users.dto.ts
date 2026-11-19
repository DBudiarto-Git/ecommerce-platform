import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import type { AppRole } from '@shared/decorators/roles.decorator';

/*
const STAFF_ROLES: Exclude<AppRole, 'CUSTOMER'>[] = [
  'ADMIN',
  'MANAGER',
  'PACKER',
  'GUEST',
];*/

export class FilterCustomersQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isActive muss true oder false sein' })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export class FilterStaffQueryDto extends FilterCustomersQueryDto {
  @IsOptional()
  @IsString()
  /*
  @IsIn(STAFF_ROLES, {
    message: `Ungültige Rolle für Mitarbeiter. Erlaubt sind: ${STAFF_ROLES.join(', ')}`,
  })*/
  roleName?: Exclude<AppRole, 'CUSTOMER'>;
}
