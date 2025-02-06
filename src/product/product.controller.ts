import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  Put,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
  ParseBoolPipe,
  Req,
  Headers,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product';
import { GetProductListDto } from './dto/get-product-list';
import { Product } from './interfaces/get-product-by-id.interface';
import { GetProductListFilterDto } from './dto/get-product-list-filter';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DownloadProductType } from './enums/download';
import { DownloadProductHistoryRequest, DownloadProductQueryDto, InformationDownloadProductRequest } from './dto/information -download-product-request';
import { FileManagerService } from '../file-manager/file-manager.service';
import { QueueBullService } from '../queue-bull/queue-bull.service';
import { RecaptchaService } from 'src/recaptcha/recaptcha.service';
import { ValidateRecaptchaDto } from 'src/recaptcha/dto/validate-recaptcha.dto';
import { plainToInstance } from 'class-transformer';


@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly fileManagerService: FileManagerService,
    private readonly queueBullService: QueueBullService,
    private readonly recaptchaService: RecaptchaService,
  ) { }

  // @Post()
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // async createProduct(@Body() createProductDto: CreateProductDto) {
  //   return this.productService.createProduct(createProductDto);
  // }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        createProductDto: {
          $ref: getSchemaPath(CreateProductDto),
        },
      },
    },
  })
  async createProduct(
    @UploadedFile() image: Express.Multer.File,
    @Body('createProductDto') createProductDto,
  ) {
    const parsedCreateProductDto: CreateProductDto = JSON.parse(createProductDto);
    const imageBuffer = image ? image.buffer : null;
    return this.productService.createProduct(parsedCreateProductDto, imageBuffer);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    //
    return this.productService.deleteProduct(id);
  }

  @Put('change-delete-status/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'is_deleted', type: Boolean, required: true }) // Define o valor padrão como true
  async changeDeleteStatusProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query('is_deleted', ParseBoolPipe) isDeleted: boolean = true, // Define o valor padrão como true no parâmetro de função
  ) {
    return this.productService.changeDeleteStatusProduct(id, isDeleted);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number, // Utilize ParseIntPipe para converter o id para número
    @Body() updateProductDto: CreateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.getProductById(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `id ${id} was NOT_FOUND`,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Get('image-supabase-base64/:id')
  async getProductImageById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.getProductImageAsBase64(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `id ${id} was NOT_FOUND`,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }



  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Get('product-in-table-key')
  // async getProductInTableKeys() {
  //   try {
  //     return await this.productService.getProductInTableKeys();
  //   } catch (error) {
  //     throw new HttpException({}, HttpStatus.FORBIDDEN, {
  //       cause: error,
  //     });
  //   }
  // }

  @Post('filter')
  @ApiBody({ type: GetProductListFilterDto })
  async filterProductList(
    @Body() filterDto: GetProductListFilterDto,
  ): Promise<GetProductListDto> {
    // const baseUrl = `${req.protocol}://${req.headers.host}`
    return this.productService.filterProductList(filterDto);
  }

  @Post('download/:id')
  @ApiBody({ type: InformationDownloadProductRequest })
  async generatePdfProductAndSendByEmail(
    @Param('id', ParseIntPipe) productId: number,
    @Query(new ValidationPipe({ transform: true })) downloadType: DownloadProductQueryDto,
    @Body() informationDownloadProduct: InformationDownloadProductRequest,
  ): Promise<any> {
    // Busca os dados do produto
    const productData = await this.productService.getProductDataByIdForPdf(productId);

    // Verifica se os dados do produto foram encontrados
    if (!productData) {
      throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND);
    }

    // Converte o body para o DTO de validação do reCAPTCHA
    const recaptchaDto = plainToInstance(ValidateRecaptchaDto, {
      recaptchaToken: informationDownloadProduct.recaptchaToken,
      recaptchaClientIp: informationDownloadProduct.recaptchaClientIp || '', // Evita valores `undefined`
    });

    try {
      await this.recaptchaService.validateRecaptcha(recaptchaDto);
    } catch (error) {
      console.error('Erro ao validar o reCAPTCHA:', error);
      throw new HttpException('Falha na validação do reCAPTCHA', HttpStatus.FORBIDDEN);
    }

    // Chama a fila para gerar o PDF
    return this.queueBullService.addGeneratePdfJob(downloadType, informationDownloadProduct, productData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-image/:id')
  @ApiConsumes('multipart/form-data') // Especifica que o endpoint consome dados em multipart/form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImages(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
      await this.productService.saveProductImage(productId, file.buffer);
      return { message: 'Image uploaded successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to upload image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('download-history')
  async getProductDownloadHistory(
    @Body() informationDownloadProduct: DownloadProductHistoryRequest) {
    return await this.productService.getProductDownloadHistory(informationDownloadProduct);
  }
}
