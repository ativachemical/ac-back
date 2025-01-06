import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RequestEmailProductDownload {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'felipesugisawa1@gmail.com',
  })
  to: string;

  @ApiProperty({
    example: 'felipesugisawa1@gmail.com',
  })
  user_name: string;

  @ApiProperty({
    example: 'SalaAis',
  })
  subject: string;

  @ApiProperty({
    example: 'seja Bem vindo ao salaAis, você já pode explorar e decolar',
  })
  text: string;

  @ApiProperty({
    example: 'Login',
  })
  button_title: string;

  @ApiProperty({
    example: `${process.env.URL_FRONTEND_LOGIN}`,
  })
  link_button: string;
}

export class EmailPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'felipesugisawa1@gmail.com',
  })
  to: string;

  @ApiProperty({
    example: 'felipesugisawa1@gmail.com',
  })
  user_name: string;

  @ApiProperty({
    example: 'SalaAis',
  })
  subject: string;

  @ApiProperty({
    example: 'test',
  })
  text: string;

  @ApiProperty({
    example: 'senha123',
  })
  password: string;
}

export class DownloadAlertRequest {
  userName: string;
  company: string;
  phoneNumber: string;
  email: string;
  productName:string;
  productId:number;
  productDataRequest:string;
}
