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
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductSpecificationJsonDto,
  CreateProductSpecificationTsvDto,
} from './dto/create-product';
import { GetProductListDto } from './dto/get-product-list';
import { Product } from './interfaces/get-product-by-id.interface';
import { GetProductListFilterDto } from './dto/get-product-list-filter';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('specification-json-format')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createProductSpecificationJson(
    @Body() createProductDto: CreateProductSpecificationJsonDto,
  ) {
    return this.productService.createProductSpecificationJson(createProductDto);
  }

  @Post('specification-tsv-format')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createProductSpecificationTsv(
    @Body() createProductDto: CreateProductSpecificationTsvDto,
  ) {
    return this.productService.createProductSpecificationTsv(createProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
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

  @Put('specification-json-format/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateProductSpecificationJson(
    @Param('id', ParseIntPipe) id: number, // Utilize ParseIntPipe para converter o id para número
    @Body() updateProductDto: CreateProductSpecificationTsvDto,
  ) {
    return this.productService.updateProductSpecificationTsv(
      id,
      updateProductDto,
    );
  }

  @Put('specification-tsv-format/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateProductSpecificationTsv(
    @Param('id', ParseIntPipe) id: number, // Utilize ParseIntPipe para converter o id para número
    @Body() updateProductDto: CreateProductSpecificationTsvDto,
  ) {
    return this.productService.updateProductSpecificationTsv(
      id,
      updateProductDto,
    );
  }

  @Get('specification-tsv-format/:id')
  async getProductByIdSpecificationTsv(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.getProductByIdSpecificationTsv(id);
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('specification-json-format/:id')
  async getProductByIdSpecificationJson(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.getProductByIdSpecificationJson(id);
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('product-in-table-key')
  async getProductInTableKeys() {
    try {
      return await this.productService.getProductInTableKeys();
    } catch (error) {
      throw new HttpException({}, HttpStatus.FORBIDDEN, {
        cause: error,
      });
    }
  }

  @Post('filter')
  @ApiBody({ type: GetProductListFilterDto })
  async filterProductList(
    @Body() filterDto: GetProductListFilterDto,
  ): Promise<GetProductListDto> {
    return this.productService.filterProductList(filterDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/upload-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      limits: {
        fileSize: 1000 * 1000, // 1MB limit per file
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          // Retorna erro 415 caso o formato não seja JPG ou JPEG
          return callback(
            new HttpException(
              'Only JPG images are allowed',
              HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data') // Indica que o endpoint consome multipart/form-data
  @ApiBody({
    description: 'Images to upload',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary', // Formato binário para arquivos
          },
        },
      },
    },
  })
  async uploadProductImages(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    try {
      // Se chegou aqui, as imagens foram validadas e podem ser processadas
      for (const image of images) {
        await this.productService.saveProductImage(productId, image.buffer);
      }
      return { message: 'Images uploaded successfully' };
    } catch (error) {
      // Captura qualquer erro que ocorra durante o processamento das imagens
      throw new HttpException(
        'Failed to upload images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
