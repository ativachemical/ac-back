import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty()
    @IsOptional()
    @IsString()
    readonly name?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsEmail()
    readonly email?: string;
  
    @ApiProperty()
    @IsOptional()
    @MinLength(8)
    password?: string;
  }
