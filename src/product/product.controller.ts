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

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
    return this.productService.filterProductList(filterDto);
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
}
