import {
    IsString,
    IsEnum,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
import { DownloadProductType } from '../enums/download';
  
export class InformationDownloadProductRequest {
    @ApiProperty({example: 'Lucas Santos'})
    @IsString()
    username: string;

    @ApiProperty({example: 'Email Teste'})
    @IsString()
    company: string;

    @ApiProperty({example: '11 978651662'})
    @IsString()
    phone_number: string;


    @ApiProperty({example: 'teste@gmail.com'})
    @IsString()
    email: string;

    @ApiProperty({example: ''})
    @IsString()
    recaptchaToken: string;

    @ApiProperty({example: ''})
    @IsString()
    recaptchaClientIp?: string;    
}

export class DownloadProductQueryDto  {
    @ApiProperty({example: DownloadProductType.PDF})
    @IsEnum(DownloadProductType, {
        message: `download_type must be one of the following: ${Object.values(
          DownloadProductType,
        ).join(', ')}`,
      })
      download_type: DownloadProductType;
}

export class DownloadProductHistoryRequest {
  @ApiProperty({example: 'Lu'})
  @IsString()
  search: string;
}