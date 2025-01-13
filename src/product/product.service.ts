import {
  Headers,
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
import {
  currentDate,
  getPath,
  limitString,
  normalizeString,
  removeAccents,
  toSnakeCase,
} from '../utils';
import { ColumnHeader, ColumnHeaderMap } from './enums/column-header';
import sizeOf from 'image-size';
import { DownloadProductType } from './enums/download';
import { DownloadProductQueryDto, InformationDownloadProductRequest } from './dto/information -download-product-request';
import { EmailService } from '../email/email.service';
import { Segment } from './enums/segment';
import { GenerateProductPdf, Topics } from '../file-manager/dto/generate-product-pdf';
import { FileManagerService } from '../file-manager/file-manager.service';
import { QueueBullService } from '../queue-bull/queue-bull.service';
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private fileManagerService: FileManagerService,
    private readonly queueBullService: QueueBullService,
  ) { }

  async createProduct(createProductDto: CreateProductDto, imageBuffer: Buffer) {
    const {
      product_title = '',
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
            update: { name: segment },
            create: {
              key: keySegment,
              name: segment,
            },
          });

          const productKey = await this.prisma.productKey.upsert({
            where: { key: keyName },
            update: { name: name },
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
          update: { name: topic.name },
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
        updated_at: new Date(),
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
      is_deleted: product.is_deleted,
      is_inactived: product.is_inactived,
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
    const limit_string = filterDto.limit_string || 100;

    // Headers fixos
    const headerNames = [
      ColumnHeader.NomeComercial,
      ColumnHeader.NomeQuimico,
      ColumnHeader.Funcao,
      ColumnHeader.Aplicacao,
      ColumnHeader.Segmentos,
      ColumnHeader.Download,
    ];

    // Buscar as chaves dos segmentos
    let segmentKeyIds: number[] = [];
    if (filterDto.segments && filterDto.segments?.length > 0) {
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
      segmentKeyIds = segmentKeys.map((segmentKey) => segmentKey.id);
    }

    // Configurar o filtro de status
    const isActiveFilter =
      filterDto.is_inactived !== undefined
        ? { is_inactived: filterDto.is_inactived }
        : {};

    const isDeletedFilter =
      filterDto.is_deleted !== undefined
        ? { is_deleted: filterDto.is_deleted }
        : {};

    // Buscar produtos com base nos filtros
    const products = await this.prisma.product.findMany({
      where: {
        ...isActiveFilter,
        ...isDeletedFilter,
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
          : {
            product_values: {
              none: {},
            },
          }),
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
        product.comercial_name || '',
        product.chemical_name || '',
        product.function || '',
        product.application || '',
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
          [ColumnHeader.NomeComercial]: limitString(
            product.comercial_name || '',
            limit_string,
          ),
          [ColumnHeader.NomeQuimico]: limitString(
            product.chemical_name || '',
            limit_string,
          ),
          [ColumnHeader.Funcao]: limitString(product.function || '', limit_string),
          [ColumnHeader.Aplicacao]: limitString(
            product.application || '',
            limit_string,
          ),
          [ColumnHeader.Segmentos]: product.product_values
            .filter((v) => v.product_key.key === 'segmentos')
            .map((v) => v.product_enum_key.key) || [],
          [ColumnHeader.Download]:
            [
              {
                type: 'pdf',
                link: `product/download/${product.id}?download_type=pdf`
              }
            ],
        };

        // Construir a lista de valores para 'rows' baseada na sequência de 'columns'
        const productValues = (filterDto.columns || headerNames).map(
          (column) => productValuesMap[column] || null,
        );

        const productItemDto: ProductListItemDto = {
          id: product.id,
          is_inactived: product.is_inactived,
          is_deleted: product.is_deleted,
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

  async getProductDataByIdForPdf(productId: number): Promise<GenerateProductPdf> {
    // Buscar o produto com os relacionamentos necessários
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        comercial_name: true,
        chemical_name: true,
        function: true,
        application: true,
        product_values: {
          include: {
            product_key: true,
            product_enum_key: true,
          },
        },
        product_specification_table: true,
        product_topic_values: {
          include: {
            product_topic_key: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    const image = await this.prisma.productImage.findFirst({
      where: {
        product_id: productId,
      },
    });

    const dimensions = sizeOf(image.source_image);
    // Converter o buffer da imagem para uma string Base64
    const base64Image = `data:image/${dimensions.type};base64,${image.source_image.toString('base64')}`;

    // Processar especificações do produto
    let data = '';
    if (product.product_specification_table.length > 0) {
      data = product.product_specification_table[0].value;
    }

    // Coletar valores dos segmentos
    const segments: Segment[] = product.product_values.map(
      (value) => value.product_enum_key.name as Segment,
    );

    // Mapeamento dos tópicos
    const topics: Topics[] = product.product_topic_values.map((topic) => ({
      key: topic.product_topic_key.name,
      value: topic.value,
    }));

    const productData = [
      {
        key: 'Nome Comercial',
        value: product.comercial_name || '',
      },
      {
        key: 'Nome Químico',
        value: product.chemical_name || '',
      },
      {
        key: 'Função',
        value: product.function || '',
      },
      {
        key: 'Aplicação',
        value: product.application || '',
      },
    ]

    // const combinedTopics: Topics[] = productData.concat(topics);

    const processTableData = (tsvData: string) => {
      return tsvData.split('\n').map(row => {
        return row.split('\t');
      });
    };

    const tableData = processTableData(data);

    // Retornar o produto no formato solicitado
    return {
      product_id: productId,
      product_name: product.comercial_name || '',
      product_image: base64Image || '',
      segments: segments,
      topicsFixed: productData,
      topics: topics,
      table: tableData,
      data_request: currentDate(),
    };
  }

  async generatePdfProductAndSendByEmail(
    downloadType: DownloadProductQueryDto,
    informationDownloadProduct: InformationDownloadProductRequest,
    productDataForPdf: GenerateProductPdf
  ) {
    const { username, company, phone_number, email } = informationDownloadProduct;

    // Validação do email
    const validateEmail = (email: string) => {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return emailRegex.test(email);
    };

    if (!validateEmail(email)) {
      throw new HttpException(
        { message: 'Email inválido', field: 'email' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação do nome
    const validateName = (text: string) => {
      const safeText = text || ""; // Valor fallback para quando 'text' for undefined ou null
      const hasRepeatedLetters = (word: string) => /([a-zA-Z])\1{2,}/.test(word);
      const words = safeText.trim().split(/\s+/);

      return (
        words.length > 1 &&
        words.every(
          (word) =>
            word.length >= 3 &&
            !hasRepeatedLetters(word) &&
            new Set(word).size > 1,
        )
      );
    };

    if (!validateName(username)) {
      throw new HttpException(
        { message: 'Um nome e sobrenome válido por favor', field: 'name' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação da empresa
    const validateCompany = (text: string) => {
      const invalidWords = [
        'test',
        'teste',
        'empresa',
        'example',
        'demo',
        'company',
        'Enterprise',
      ];
      const hasRepeatedLetters = (input: string) => /([a-zA-Z])\1{2,}/.test(input);

      return (
        text.length > 2 &&
        !invalidWords.includes(text.toLowerCase()) &&
        !hasRepeatedLetters(text)
      );
    };

    if (!validateCompany(company)) {
      throw new HttpException(
        { message: 'Uma empresa válida por favor', field: 'company' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileName = `product_${new Date().toISOString().replace(/[:.-]/g, '')}.pdf`

    try {
      // Aguarda a execução da função que gera os arquivos e retorna os caminhos dos arquivos
      const { createdFiles } = await this.fileManagerService.generateConvertedPdfPagesToImage(productDataForPdf, fileName);

      await this.prisma.productDownloadHistory.create({
        data: {
          name: username,
          email: email,
          company: company,
          phone_number: phone_number,
          product_name: productDataForPdf.product_name,
          product_id: productDataForPdf.product_id,
        }
      })

      // Envia o e-mail com o arquivo anexo
      await this.emailService.sendEmailProductAtached(
        informationDownloadProduct.email,
        informationDownloadProduct.username,
        `${productDataForPdf.product_name}.pdf`,
        getPath(`src/assets/temp/pdf-by-images/${fileName}`)
      );

      await this.emailService.sendDownloadAlert({
        userName: informationDownloadProduct.username,
        company: informationDownloadProduct.company,
        phoneNumber: informationDownloadProduct.phone_number,
        email: informationDownloadProduct.email,
        productName: productDataForPdf.product_name,
        productId: productDataForPdf.product_id,
        productDataRequest: productDataForPdf.data_request,
      })

      await this.fileManagerService.deleteFiles(createdFiles);

    } catch (error) {
      console.error('Erro durante o processo generatePdfProductAndSendByEmail:', error);
    }
    return 'OK';
  }

  async getProductDownloadHistory(): Promise<any> {
    return await this.prisma.productDownloadHistory.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
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
