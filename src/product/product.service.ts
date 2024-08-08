import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product';
import { GetProductListDto, ProductListItemDto } from './dto/get-product-list';
import { Product } from './interfaces/get-product-by-id.interface';
import {
  CreateItemInTableDto,
  CreateTopicDto,
} from './dto/get-product-by-id copy';
import { GetProductListFilterDto } from './dto/get-product-list-filter';
import { normalizeString, removeAccents, toSnakeCase } from '../utils';
import { ColumnHeader, ColumnHeaderMap } from './dto/enums/column-header';
import * as sharp from 'sharp'; //img info
import sizeOf from 'image-size';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, imageBuffer: Buffer) {
    const {
      product_title,
      comercial_name,
      chemical_name,
      function: product_function,
      application,
      product_enums = [],
      topics = [],
      data,
    } = createProductDto;

    // Processar segmentos em product_enums
    const productEnumValues = await Promise.all(
      product_enums
        .filter((item) => Array.isArray(item.value))
        .flatMap((item) =>
          item.value.map((segment) => ({ name: item.name, segment })),
        )
        .map(async ({ name, segment }) => {
          const keyName = toSnakeCase(name);
          const keySegment = toSnakeCase(segment);

          const productSegmentKey = await this.prisma.productEnumKey.upsert({
            where: { key: keySegment },
            update: {},
            create: {
              key: keySegment,
              name: segment,
            },
          });

          const productKey = await this.prisma.productKey.upsert({
            where: { key: keyName },
            update: {},
            create: {
              key: keyName,
              name: name,
            },
          });

          return {
            product_enum_key_id: productSegmentKey.id,
            product_key_id: productKey.id,
          };
        }),
    );

    // Processar tópicos
    const topicValues = await Promise.all(
      topics.map(async (topic) => {
        const key = toSnakeCase(topic.name);

        // Encontrar ou criar ProductTopicKey
        const productTopicKey = await this.prisma.productTopicKey.upsert({
          where: { key },
          update: {},
          create: {
            key,
            name: topic.name,
          },
        });

        return {
          product_topic_key_id: productTopicKey.id,
          value: topic.value,
        };
      }),
    );

    // Criar o produto com todas as informações
    const product = await this.prisma.product.create({
      data: {
        product_title,
        comercial_name: comercial_name || '',
        chemical_name: chemical_name || '',
        function: product_function || '',
        application: application || '',
        is_inactived: createProductDto.is_inactived || false,
        is_deleted: createProductDto.is_deleted || false,
        product_values: {
          create: productEnumValues,
        },
        product_topic_values: {
          create: topicValues,
        },
        product_specification_table: {
          create: {
            value: data || '',
          },
        },
      },
    });

    // Salvar a imagem se fornecida
    if (imageBuffer) {
      await this.saveProductImage(product.id, imageBuffer);
    }

    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: CreateProductDto,
    imageBuffer?: Buffer,
  ): Promise<any> {
    const {
      product_title,
      comercial_name,
      chemical_name,
      function: product_function,
      application,
      product_enums = [],
      topics = [],
      data,
    } = updateProductDto;

    // Processar segmentos em product_enums
    const productEnumValues = await Promise.all(
      product_enums
        .filter((item) => Array.isArray(item.value))
        .flatMap((item) =>
          item.value.map((segment) => ({ name: item.name, segment })),
        )
        .map(async ({ name, segment }) => {
          const keyName = toSnakeCase(name);
          const keySegment = toSnakeCase(segment);

          const productSegmentKey = await this.prisma.productEnumKey.upsert({
            where: { key: keySegment },
            update: {},
            create: {
              key: keySegment,
              name: segment,
            },
          });

          const productKey = await this.prisma.productKey.upsert({
            where: { key: keyName },
            update: {},
            create: {
              key: keyName,
              name: name,
            },
          });

          return {
            product_enum_key_id: productSegmentKey.id,
            product_key_id: productKey.id,
          };
        }),
    );

    // Processar tópicos
    const topicValues = await Promise.all(
      topics.map(async (topic) => {
        const key = toSnakeCase(topic.name);

        const productTopicKey = await this.prisma.productTopicKey.upsert({
          where: { key },
          update: {},
          create: {
            key,
            name: topic.name,
          },
        });

        return {
          product_topic_key_id: productTopicKey.id,
          value: topic.value,
        };
      }),
    );

    // Atualizar o produto com todas as informações
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        product_title,
        comercial_name: comercial_name || '',
        chemical_name: chemical_name || '',
        function: product_function || '',
        application: application || '',
        is_inactived: updateProductDto.is_inactived || false,
        is_deleted: updateProductDto.is_deleted || false,
        product_values: {
          deleteMany: {}, // Remove all existing product_values for the product
          create: productEnumValues,
        },
        product_topic_values: {
          deleteMany: {}, // Remove all existing product_topic_values for the product
          create: topicValues,
        },
        product_specification_table: {
          deleteMany: {},
          create: {
            value: data || '',
          },
        },
      },
    });

    // Salvar a imagem se fornecida
    if (imageBuffer) {
      await this.saveProductImage(updatedProduct.id, imageBuffer);
    }

    return updatedProduct;
  }

  async deleteProduct(id: number) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Código de erro específico do Prisma para "Registro não encontrado"
        throw new NotFoundException(`Produto com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async changeDeleteStatusProduct(id: number, isDeleted: boolean) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: { is_deleted: isDeleted, updated_at: new Date() },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Código de erro específico do Prisma para "Registro não encontrado"
        throw new NotFoundException(`Produto com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async getProductById(productId: number): Promise<any> {
    // Buscar o produto com os relacionamentos necessários
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        product_values: {
          include: { product_key: true, product_enum_key: true },
        },
        product_specification_table: true,
        product_topic_values: {
          include: { product_topic_key: true },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    // Processar especificações do produto
    let data = '';
    if (product.product_specification_table.length > 0) {
      data = product.product_specification_table[0].value;
    }

    // Coletar valores dos segmentos
    const segments = product.product_values.map(
      (value) => value.product_enum_key.name,
    );

    // Mapeamento dos tópicos
    const topics = product.product_topic_values.map((topic) => ({
      name: topic.product_topic_key.name,
      value: topic.value,
    }));

    // Retornar o produto no formato solicitado
    return {
      id: product.id,
      product_title: product.product_title || '',
      comercial_name: product.comercial_name || '',
      chemical_name: product.chemical_name || '',
      function: product.function || '',
      application: product.application || '',
      segments: segments,
      topics: topics,
      data: data,
    };
  }

  async filterProductList(
    filterDto: GetProductListFilterDto,
  ): Promise<GetProductListDto> {
    // Definir valor default para o campo search
    const searchTerm = filterDto.search || '';

    // Headers fixos (serão utilizados para correspondência com os valores das colunas)
    const headerNames = [
      ColumnHeader.NomeComercial,
      ColumnHeader.NomeQuimico,
      ColumnHeader.Funcao,
      ColumnHeader.Aplicacao,
      ColumnHeader.Segmentos,
    ];

    // Buscar as chaves dos segmentos
    let segmentKeyIds: number[] = [];

    if (filterDto.segments && filterDto.segments.length > 0) {
      const segmentKeys = await this.prisma.productEnumKey.findMany({
        where: {
          key: {
            in: filterDto.segments,
          },
        },
        select: {
          id: true,
        },
      });

      if (segmentKeys.length === 0) {
        throw new Error(
          `Nenhum ProductSegmentKey encontrado para as chaves fornecidas: ${filterDto.segments.join(', ')}`,
        );
      }

      segmentKeyIds = segmentKeys.map((segmentKey) => segmentKey.id);
    }

    // Configurar o filtro de status
    let isActiveFilter = {};
    if (filterDto.is_inactived !== undefined) {
      isActiveFilter = {
        is_inactived: filterDto.is_inactived,
      };
    }

    // Buscar produtos com base nos filtros
    const products = await this.prisma.product.findMany({
      where: {
        ...isActiveFilter,
        is_deleted: false,
        ...(segmentKeyIds.length > 0
          ? {
              product_values: {
                some: {
                  product_enum_key_id: {
                    in: segmentKeyIds,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        product_values: {
          include: {
            product_key: true,
            product_enum_key: true,
          },
        },
      },
    });

    // Normalizar o termo de busca
    const normalizedSearchTerm = normalizeString(searchTerm);

    // Filtrar produtos
    const filteredProducts = products.filter((product) => {
      const productValues = [
        product.comercial_name,
        product.chemical_name,
        product.function,
        product.application,
      ].map(normalizeString);

      return productValues.some((value) =>
        value.includes(normalizedSearchTerm),
      );
    });

    // Preparar o DTO de resposta
    const productListDto: GetProductListDto = {
      headers: (filterDto.columns || headerNames).map(
        (column) => ColumnHeaderMap[column] || column,
      ),
      items: filteredProducts.map((product) => {
        // Mapeamento de valores baseado nas colunas fornecidas
        const productValuesMap = {
          [ColumnHeader.NomeComercial]: product.comercial_name,
          [ColumnHeader.NomeQuimico]: product.chemical_name,
          [ColumnHeader.Funcao]: product.function,
          [ColumnHeader.Aplicacao]: product.application,
          [ColumnHeader.Segmentos]: product.product_values
            .filter((v) => v.product_key.key === 'segmentos')
            .map((v) => v.product_enum_key.key),
        };

        // Construir a lista de valores para 'rows' baseada na sequência de 'columns'
        const productValues = (filterDto.columns || headerNames).map(
          (column) => productValuesMap[column] || null,
        );

        const productItemDto: ProductListItemDto = {
          id: product.id,
          is_inactived: product.is_inactived,
          rows: productValues,
        };

        return productItemDto;
      }),
    };

    return productListDto;
  }

  async saveProductImage(productId: number, imageBytes: Buffer) {
    try {
      // Deletar todas as imagens associadas ao productId
      await this.prisma.productImage.deleteMany({
        where: {
          product_id: productId,
        },
      });

      // Criar a nova imagem
      const savedImage = await this.prisma.productImage.create({
        data: {
          product_id: productId,
          source_image: imageBytes,
        },
      });

      return savedImage;
    } catch (error) {
      console.error('Error saving product image:', error);
      throw error;
    }
  }

  async getProductImageAsBase64(productId: number) {
    try {
      // Recuperar a imagem do banco de dados com base no ID do produto
      const image = await this.prisma.productImage.findFirst({
        where: {
          product_id: productId,
        },
      });

      if (!image) {
        throw new NotFoundException('Imagem não encontrada');
      }

      // Converter o buffer da imagem para uma string Base64
      const base64Image = image.source_image.toString('base64');

      // Usar a biblioteca image-size para obter a resolução da imagem
      const dimensions = sizeOf(image.source_image);
      const resolution = `${dimensions.width} x ${dimensions.height}`;
      const extension = dimensions.type; // Formato da imagem
      const sizeInBytes = image.source_image.length;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

      return {
        data: {
          resolution,
          extension,
          sizeKB: sizeInKB,
          sizeMB: sizeInMB,
          base64Image, // Nome do arquivo para download
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Propagar a exceção NotFoundException
        throw error;
      }
      console.error('Error retrieving product image:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Erro ao recuperar imagem',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  // async getProductInTableKeys(): Promise<string[]> {
  //   try {
  //     // Primeiro, busque todos os ids que estão em ProductInTableSegmentValue
  //     const usedKeys = await this.prisma.productInTableSegmentValue.findMany({
  //       select: {
  //         product_in_table_key_id: true,
  //       },
  //     });

  //     const usedKeyIds = usedKeys.map((key) => key.product_in_table_key_id);

  //     // Agora, busque os nomes que não estão na lista de ids usados
  //     const keys = await this.prisma.productInTableKey.findMany({
  //       where: {
  //         id: {
  //           in: usedKeyIds,
  //         },
  //       },
  //       select: {
  //         name: true,
  //       },
  //     });

  //     return keys.map((key) => key.name);
  //   } catch (error) {
  //     throw new Error(`Failed to get product in table keys: ${error.message}`);
  //   }
  // }
}
