import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize the Prisma Client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  // Create a user (if not already created)
  const passwordUser1 = await bcrypt.hash('@ativachemical@132', roundsOfHashing);

  const user = await prisma.user.upsert({
    where: { email: 'ativachemical@gmail.com' },
    update: {},
    create: {
      email: 'ativachemical@gmail.com',
      name: 'Ativa Chemical',
      password: passwordUser1,
    },
  });

  // List of products to create
  const productListById = [
    {
      item_in_table: [
        { name: 'Nome químico', value: 'Nome químico 1' },
        { name: 'Nome Comercial', value: 'Cloreto de Sódio' },
        { name: 'Função', value: 'Função 1' },
        { name: 'Aplicação', value: 'Aplicação 1' },
        { name: 'Segmentos', value: ['PaintsResins'] },
      ],
      topics: [
        {
          name: 'Pureza',
          value: 'A pureza do produto pode variar entre 90% e 95%',
        },
        { name: 'Densidade', value: 'A densidade é de 1.32 g/cm³ a 20°C' },
        {
          name: 'Solubilidade',
          value: 'Solúvel em água a uma concentração de aproximadamente 360g/L a 20°C.',
        },
        {
          name: 'Composição Química',
          value: 'Cl- (íon cloreto): 60.66%, Na+ (íon sódio): 39.34%',
        },
      ],
      data: {
        headers: [
          'Propriedade',
          'Valor',
          'Método de Medição',
          'Condições',
          'Precisão',
          'Limite de Detecção',
        ],
        rows: [
          ['row1', 'row1', 'row1', 'row1', 'row1', 'row1'],
          ['row2', 'row2', 'row2', 'row2', 'row2', 'row2'],
          ['row3', 'row3', 'row3', 'row3', 'row3', 'row3'],
          ['row4', 'row4', 'row4', 'row4', 'row4', 'row4'],
        ],
      },
    },
    {
      item_in_table: [
        { name: 'Nome químico', value: 'Nome químico 2' },
        { name: 'Nome Comercial', value: 'Sulfato de Cálcio' },
        { name: 'Função', value: 'Função 2' },
        { name: 'Aplicação', value: 'Aplicação 2' },
        { name: 'Segmentos', value: ['Pharmaceuticals', 'Cosmetics'] },
      ],
      topics: [
        {
          name: 'Pureza',
          value: 'A pureza do produto pode variar entre 85% e 92%',
        },
        { name: 'Densidade', value: 'A densidade é de 2.32 g/cm³ a 25°C' },
        {
          name: 'Solubilidade',
          value: 'Pouco solúvel em água, solúvel em ácidos diluídos.',
        },
        {
          name: 'Composição Química',
          value: 'Ca2+ (íon cálcio): 29.44%, SO4 2- (íon sulfato): 70.56%',
        },
      ],
      data: {
        headers: [
          'Propriedade',
          'Valor',
          'Método de Medição',
          'Condições',
          'Precisão',
          'Limite de Detecção',
        ],
        rows: [
          ['row1', 'row1', 'row1', 'row1', 'row1', 'row1'],
          ['row2', 'row2', 'row2', 'row2', 'row2', 'row2'],
          ['row3', 'row3', 'row3', 'row3', 'row3', 'row3'],
          ['row4', 'row4', 'row4', 'row4', 'row4', 'row4'],
        ],
      },
    },
  ];

  const productInTableKeyData = [
    { name: 'Nome Comercial', key: 'nome_comercial' },
    { name: 'Nome químico', key: 'nome_quimico' },
    { name: 'Função', key: 'funcao' },
    { name: 'Aplicação', key: 'aplicacao' },
    { name: 'Segmentos', key: 'segmentos' },
  ];

  // Create the item in table keys
  const createdKeys = await Promise.all(
    productInTableKeyData.map(createItemInTableKeys),
  );

  // Create the products
  // const createdProducts = await Promise.all(
  //   productListById.map(async productData => {
  //     const itemInTableValues = productData.item_in_table.map(item => {
  //       const key = createdKeys.find(k => k.name === item.name);
  //       return {
  //         value: Array.isArray(item.value) ? item.value.join(', ') : item.value,
  //         item_in_table_key: {
  //           connect: { id: key.id },
  //         }
  //       };
  //     });

  //     const segments = productData.item_in_table.find(item => item.name === 'Segmentos');
  //     const segmentValues = Array.isArray(segments?.value) 
  //       ? segments.value.map(segment => ({
  //           value: segment,
  //           product_segment_key: {
  //             connectOrCreate: {
  //               where: { key: segment },
  //               create: { key: segment, name: segment }
  //             }
  //           },
  //           product_in_table_key: {
  //             connect: { id: createdKeys.find(k => k.key === 'segmentos')?.id }
  //           }
  //         })) 
  //       : [];

  //     const createdProduct = await prisma.product.create({
  //       data: {
  //         item_in_table_values: {
  //           create: itemInTableValues
  //         },
  //         segments: {
  //           create: segmentValues
  //         },
  //         product_topics: {
  //           create: productData.topics.map(topic => ({
  //             value: topic.value,
  //             product_topic_key: {
  //               connectOrCreate: {
  //                 where: { key: topic.name },
  //                 create: { key: topic.name, name: topic.name }
  //               }
  //             }
  //           }))
  //         },
  //         product_specifications_values: {
  //           create: productData.data.rows.map(row => ({
  //             value: row[1],
  //             product_specification_key: {
  //               connectOrCreate: {
  //                 where: { key: row[0] },
  //                 create: { key: row[0], name: row[0] }
  //               }
  //             }
  //           }))
  //         }
  //       }
  //     });

  //     return createdProduct;
  //   })
  // );

  // console.log('Created products:', createdProducts);
}

async function createItemInTableKeys(keyData) {
  const createdKey = await prisma.productInTableKey.upsert({
    where: { key: keyData.key },
    update: {},
    create: keyData,
  });

  return createdKey;
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma Client at the end
    await prisma.$disconnect();
  });
