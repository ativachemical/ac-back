import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductSpecificationJsonDto,
  CreateProductSpecificationTsvDto,
} from './dto/create-product';
import { GetProductListDto, ProductListItemDto } from './dto/get-product-list';
import { Product } from './interfaces/get-product-by-id.interface';
import {
  CreateItemInTableDto,
  CreateTopicDto,
} from './dto/get-product-by-id copy';
import { GetProductListFilterDto } from './dto/get-product-list-filter';
import { normalizeString, removeAccents, toSnakeCase } from '../utils';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProductSpecificationJson(
    createProductDto: CreateProductSpecificationJsonDto,
  ) {
    const { product_title, item_in_table, topics, data } = createProductDto;

    // Filter out segment items from item_in_table
    const nonSegmentItems = item_in_table.filter(
      (item) => item.name !== 'Segmentos',
    );

    // Process non-segment items in item_in_table
    const itemInTableValues = await Promise.all(
      nonSegmentItems.map(async (item) => {
        const key = toSnakeCase(item.name);

        let productInTableKey = await this.prisma.productInTableKey.findUnique({
          where: { key },
        });

        if (!productInTableKey) {
          productInTableKey = await this.prisma.productInTableKey.create({
            data: {
              key,
              name: item.name,
            },
          });
        }

        return {
          product_in_table_key_id: productInTableKey.id,
          value: Array.isArray(item.value) ? item.value.join(', ') : item.value,
        };
      }),
    );

    // Process topics
    const topicValues = await Promise.all(
      topics.map(async (topic) => {
        const key = toSnakeCase(topic.name);

        let productTopicKey = await this.prisma.productTopicKey.findUnique({
          where: { key },
        });

        if (!productTopicKey) {
          productTopicKey = await this.prisma.productTopicKey.create({
            data: {
              key,
              name: topic.name,
            },
          });
        }

        return {
          product_topic_key_id: productTopicKey.id,
          value: topic.value,
        };
      }),
    );

    // Process segments
    const segmentItem = item_in_table.find((item) => item.name === 'Segmentos');
    const segments = Array.isArray(segmentItem?.value) ? segmentItem.value : [];

    const segmentValues = await Promise.all(
      segments.map(async (segment) => {
        const key = toSnakeCase(segment);

        let productSegmentKey = await this.prisma.productSegmentKey.findUnique({
          where: { key },
        });

        if (!productSegmentKey) {
          productSegmentKey = await this.prisma.productSegmentKey.create({
            data: {
              key,
              name: segment,
            },
          });
        }

        return {
          product_segment_key_id: productSegmentKey.id,
          product_in_table_key_id: productSegmentKey.id,
        };
      }),
    );

    // Process specifications (data)
    const specificationValues = [
      data.headers.join('\t'), // Join headers with tab as separator
      ...data.rows.map((row) => row.join('\t')), // Join each row's values with tab as separator
    ].join('\r\n'); // Join rows with carriage return and new line

    const product = await this.prisma.product.create({
      data: {
        product_title: product_title,
        is_active: true,
        product_in_table_values: {
          create: itemInTableValues,
        },
        product_topics: {
          create: topicValues,
        },
        product_in_table_segments_values: {
          create: segmentValues,
        },
        product_specifications_values: {
          create: {
            value: specificationValues,
          },
        },
      },
    });

    return product;
  }

  async createProductSpecificationTsv(
    createProductDto: CreateProductSpecificationTsvDto,
  ) {
    const { product_title, segments, item_in_table, topics, data } =
      createProductDto;

    // Filtrar itens que não são segmentos
    const nonSegmentItems = item_in_table.filter(
      (item) => item.name !== 'Segmentos',
    );

    // Processar itens que não são segmentos
    const itemInTableValues = await Promise.all(
      nonSegmentItems.map(async (item) => {
        const key = toSnakeCase(item.name);

        let productInTableKey = await this.prisma.productInTableKey.findUnique({
          where: { key },
        });

        if (!productInTableKey) {
          productInTableKey = await this.prisma.productInTableKey.create({
            data: {
              key,
              name: item.name,
            },
          });
        }

        return {
          product_in_table_key_id: productInTableKey.id,
          value: Array.isArray(item.value) ? item.value.join(', ') : item.value,
        };
      }),
    );

    // Processar tópicos
    const topicValues = await Promise.all(
      topics.map(async (topic) => {
        const key = toSnakeCase(topic.name);

        let productTopicKey = await this.prisma.productTopicKey.findUnique({
          where: { key },
        });

        if (!productTopicKey) {
          productTopicKey = await this.prisma.productTopicKey.create({
            data: {
              key,
              name: topic.name,
            },
          });
        }

        return {
          product_topic_key_id: productTopicKey.id,
          value: topic.value,
        };
      }),
    );

    // Processar segmentos
    const segmentsArray = segments;

    const segmentValues = await Promise.all(
      segmentsArray.map(async (segment) => {
        const key = toSnakeCase(segment);

        let productSegmentKey = await this.prisma.productSegmentKey.findUnique({
          where: { key },
        });

        if (!productSegmentKey) {
          productSegmentKey = await this.prisma.productSegmentKey.create({
            data: {
              key,
              name: segment,
            },
          });
        }

        return {
          product_segment_key_id: productSegmentKey.id,
          // Assuming you need to associate segment values with table values,
          // adjust this based on your schema and requirements
          product_in_table_key_id: productSegmentKey.id,
        };
      }),
    );

    // Usar a string data diretamente
    const specificationValues = data;

    const product = await this.prisma.product.create({
      data: {
        product_title: product_title,
        is_active: true,
        product_in_table_values: {
          create: itemInTableValues,
        },
        product_topics: {
          create: topicValues,
        },
        product_in_table_segments_values: {
          create: segmentValues,
        },
        product_specifications_values: {
          create: {
            value: specificationValues,
          },
        },
      },
    });

    return product;
  }

  async updateProductSpecificationTsv(
    id: number,
    createProductDto: CreateProductSpecificationTsvDto,
  ): Promise<any> {
    const { product_title, segments, item_in_table, topics, data } =
      createProductDto;

    // Delete existing values
    await this.prisma.productInTableSegmentValue.deleteMany({
      where: { product_id: id },
    });
    await this.prisma.productInTableValue.deleteMany({
      where: { product_id: id },
    });
    await this.prisma.productTopicValue.deleteMany({
      where: { product_id: id },
    });
    await this.prisma.productSpecification.deleteMany({
      where: { product_id: id },
    });

    // Filter and process items that are not segments
    const nonSegmentItems = item_in_table.filter(
      (item) => item.name !== 'Segmentos',
    );

    const itemInTableValues = await Promise.all(
      nonSegmentItems.map(async (item) => {
        const key = toSnakeCase(item.name);

        let productInTableKey = await this.prisma.productInTableKey.findUnique({
          where: { key },
        });

        if (productInTableKey) {
          productInTableKey = await this.prisma.productInTableKey.update({
            where: { key },
            data: { name: item.name },
          });
        } else {
          productInTableKey = await this.prisma.productInTableKey.create({
            data: {
              key,
              name: item.name,
            },
          });
        }

        return {
          product_in_table_key_id: productInTableKey.id,
          value: Array.isArray(item.value) ? item.value.join(', ') : item.value,
        };
      }),
    );

    // Process topics
    const topicValues = await Promise.all(
      topics.map(async (topic) => {
        const key = toSnakeCase(topic.name);

        let productTopicKey = await this.prisma.productTopicKey.findUnique({
          where: { key },
        });

        if (productTopicKey) {
          productTopicKey = await this.prisma.productTopicKey.update({
            where: { key },
            data: { name: topic.name },
          });
        } else {
          productTopicKey = await this.prisma.productTopicKey.create({
            data: {
              key,
              name: topic.name,
            },
          });
        }

        return {
          product_topic_key_id: productTopicKey.id,
          value: topic.value,
        };
      }),
    );

    // Process segments
    const segmentValues = await Promise.all(
      segments.map(async (segment) => {
        const key = toSnakeCase(segment);

        let productSegmentKey = await this.prisma.productSegmentKey.findUnique({
          where: { key },
        });

        if (!productSegmentKey) {
          productSegmentKey = await this.prisma.productSegmentKey.create({
            data: {
              key,
              name: segment,
            },
          });
        }

        return {
          product_segment_key_id: productSegmentKey.id,
          product_in_table_key_id: productSegmentKey.id,
        };
      }),
    );

    // Ensure data is an array, or convert it to an array
    const specificationValues = Array.isArray(data)
      ? data.map((value) => ({
          product_id: id,
          value: value,
        }))
      : [{ product_id: id, value: data }]; // Handle case where data is a single string

    await this.prisma.productSpecification.createMany({
      data: specificationValues,
    });

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        product_title,
        product_in_table_values: {
          create: itemInTableValues,
        },
        product_topics: {
          create: topicValues,
        },
        product_in_table_segments_values: {
          create: segmentValues,
        },
      },
    });

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

  async getProductByIdSpecificationJson(productId: number): Promise<any> {
    const headers = await this.prisma.productInTableKey.findMany({
      select: {
        name: true,
      },
    });
    const headerNames = headers.map((header) => header.name);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        product_in_table_values: {
          include: { product_in_table_key: true },
        },
        product_in_table_segments_values: {
          include: { product_segment_key: true, product_in_table_key: true },
        },
        product_specifications_values: true,
        product_topics: {
          include: { product_topic_key: true },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    // Initialize an array to store rows
    let headersData: string[] = [];
    let rowsData: string[][] = [];

    // Populate rows with product_specifications_values
    product.product_specifications_values.forEach((spec) => {
      // Split the spec.value into headers and rows
      const lines = spec.value.split('\r\n');
      headersData = lines[0].split('\t'); // first line is headers
      rowsData = lines.slice(1).map((line) => line.split('\t')); // remaining lines are rows
    });

    // Collect segment values grouped by ProductInTableKey.name
    const segmentGroups = product.product_in_table_segments_values.reduce(
      (acc, segment) => {
        const keyName = segment.product_in_table_key.name;
        if (!acc[keyName]) {
          acc[keyName] = [];
        }
        acc[keyName].push(segment.product_segment_key.name);
        return acc;
      },
      {},
    );
    const segments = product.product_in_table_segments_values.map(
      (segment) => segment.product_segment_key.key,
    );

    // Mapping to match your expected structure
    return {
      id: product.id,
      product_title: product.product_title,
      segments: segments,
      item_in_table: [
        ...product.product_in_table_values.map((item) => ({
          name: item.product_in_table_key.name,
          value: item.value,
        })),
      ],
      topics: product.product_topics.map((topic) => ({
        name: topic.product_topic_key.name,
        value: topic.value,
      })),
      data: {
        headers: headersData,
        rows: rowsData,
      },
    };
  }

  async getProductByIdSpecificationTsv(productId: number): Promise<any> {
    const headers = await this.prisma.productInTableKey.findMany({
      select: {
        name: true,
      },
    });
    const headerNames = headers.map((header) => header.name);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        product_in_table_values: {
          include: { product_in_table_key: true },
        },
        product_in_table_segments_values: {
          include: { product_segment_key: true, product_in_table_key: true },
        },
        product_specifications_values: true,
        product_topics: {
          include: { product_topic_key: true },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    // Initialize an array to store rows
    let headersData: string[] = [];
    let rowsData: string[][] = [];

    // Populate rows with product_specifications_values
    product.product_specifications_values.forEach((spec) => {
      // Split the spec.value into headers and rows
      const lines = spec.value.split('\r\n');
      headersData = lines[0].split('\t'); // first line is headers
      rowsData = lines.slice(1).map((line) => line.split('\t')); // remaining lines are rows
    });

    // Collect segment values grouped by ProductInTableKey.name
    const segmentGroups = product.product_in_table_segments_values.reduce(
      (acc, segment) => {
        const keyName = segment.product_in_table_key.name;
        if (!acc[keyName]) {
          acc[keyName] = [];
        }
        acc[keyName].push(segment.product_segment_key.name);
        return acc;
      },
      {},
    );
    const segments = product.product_in_table_segments_values.map(
      (segment) => segment.product_segment_key.key,
    );

    // Convert headersData and rowsData to TSV format
    const tsvHeaders = headersData.join('\t');
    const tsvRows = rowsData.map((row) => row.join('\t')).join('\r\n');
    const tsvData = `${tsvHeaders}\r\n${tsvRows}`;

    // Mapping to match your expected structure
    return {
      id: product.id,
      product_title: product.product_title,
      segments: segments,
      item_in_table: [
        ...product.product_in_table_values.map((item) => ({
          name: item.product_in_table_key.name,
          value: item.value,
        })),
      ],
      topics: product.product_topics.map((topic) => ({
        name: topic.product_topic_key.name,
        value: topic.value,
      })),
      data: tsvData, // Include TSV data here
    };
  }

  async filterProductList(
    filterDto: GetProductListFilterDto,
  ): Promise<GetProductListDto> {
    const headers = await this.prisma.productInTableKey.findMany({
      select: {
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const headerNames = headers.map((header) => header.name);
  
    let segmentKeyIds: number[] = [];
  
    if (filterDto.segments && filterDto.segments.length > 0) {
      const segmentKeys = await this.prisma.productSegmentKey.findMany({
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
  
    let isActiveFilter = {};
    if (filterDto.is_active !== undefined) {
      isActiveFilter = {
        is_active: filterDto.is_active,
      };
    }
  
    const products = await this.prisma.product.findMany({
      where: {
        ...isActiveFilter,
        is_deleted: false,
        ...(segmentKeyIds.length > 0
          ? {
              product_in_table_segments_values: {
                some: {
                  product_segment_key_id: {
                    in: segmentKeyIds,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        product_in_table_values: true,
        product_in_table_segments_values: {
          include: {
            product_segment_key: true,
          },
        },
      },
    });
  
    const normalizedSearchTerm = filterDto.search
      ? normalizeString(filterDto.search)
      : '';
  
    const filteredProducts = products.filter((product) => {
      const productValues = product.product_in_table_values.map((value) =>
        normalizeString(value.value),
      );
  
      const allValues = [...productValues];
      return allValues.some((value) =>
        value.includes(normalizedSearchTerm),
      );
    });
  
    const productListDto: GetProductListDto = {
      headers: headerNames,
      items: filteredProducts.map((product) => {
        const productValues = product.product_in_table_values.map(
          (value) => value.value,
        );
        const segmentNames = product.product_in_table_segments_values.map(
          (segment) => segment.product_segment_key.key,
        );
  
        const rows: (string | string[])[] = [...productValues, segmentNames];
  
        const productItemDto: ProductListItemDto = {
          id: product.id,
          is_active: product.is_active,
          rows: rows,
        };
  
        return productItemDto;
      }),
    };
  
    return productListDto;
  }

  async saveProductImage(productId: number, imageBytes: Buffer) {
    try {
      const byteArray = Array.from(imageBytes).join(', ');
      const savedImage = await this.prisma.productImage.create({
        data: {
          product_id: productId,
          source_image: imageBytes, // Usando diretamente imageBytes como buffer
        },
      });
      return savedImage;
    } catch (error) {
      console.error('Error saving product image:', error);
      throw error;
    }
  }

  async getProductInTableKeys(): Promise<string[]> {
    try {
      // Primeiro, busque todos os ids que estão em ProductInTableSegmentValue
      const usedKeys = await this.prisma.productInTableSegmentValue.findMany({
        select: {
          product_in_table_key_id: true,
        },
      });

      const usedKeyIds = usedKeys.map(key => key.product_in_table_key_id);

      // Agora, busque os nomes que não estão na lista de ids usados
      const keys = await this.prisma.productInTableKey.findMany({
        where: {
          id: {
            in: usedKeyIds,
          },
        },
        select: {
          name: true,
        },
      });

      return keys.map(key => key.name);
    } catch (error) {
      throw new Error(`Failed to get product in table keys: ${error.message}`);
    }
  }
}
