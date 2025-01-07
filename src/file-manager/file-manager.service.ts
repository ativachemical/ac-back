import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromisses from 'fs/promises';
import { currentDate, getPath } from '../utils';
import { GenerateProductPdf } from './dto/generate-product-pdf';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as path from 'path';
import * as pdfLib from 'pdf-lib';
import { pdfToPng } from 'pdf-to-png-converter';

export interface PdfGenerationResult {
    createdFiles: string[];
}

@Injectable()
export class FileManagerService {
    onModuleInit() {
        // Função para carregar o arquivo como base64
        const loadFontAsBase64 = (fontPath: string) => {
            const fileBuffer = fs.readFileSync(fontPath);
            return fileBuffer.toString('base64');
        };

        // Registre as fontes manualmente (executado apenas uma vez)
        pdfMake.vfs = {
            'Roboto-Regular.ttf': loadFontAsBase64('src/assets/fonts/Roboto-Regular.ttf'),
            'Roboto-Medium.ttf': loadFontAsBase64('src/assets/fonts/Roboto-Medium.ttf'),
            'Roboto-Italic.ttf': loadFontAsBase64('src/assets/fonts/Roboto-Italic.ttf'),
            'Roboto-MediumItalic.ttf': loadFontAsBase64('src/assets/fonts/Roboto-MediumItalic.ttf'),
        };

        pdfMake.fonts = {
            Roboto: {
                normal: 'Roboto-Regular.ttf',
                bold: 'Roboto-Medium.ttf',
                italics: 'Roboto-Italic.ttf',
                bolditalics: 'Roboto-MediumItalic.ttf',
            },
        };
    }

    async convertPdfToImages(inputPdfPath: string): Promise<string[]> {
        try {
            // Verificar se o arquivo existe
            if (!fs.existsSync(inputPdfPath)) {
                throw new Error('PDF file does not exist');
            }

            // Diretório de fontes customizadas
            const fontDir = path.resolve('src/assets/fonts/');
            if (!fs.existsSync(fontDir)) {
                throw new Error('Font directory does not exist');
            }

            // Verificar se o diretório de saída existe
            const outputDir = path.resolve('src/assets/temp/img-from-pdf/');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }

            // Ler o buffer do arquivo PDF
            const pdfBuffer = fs.readFileSync(inputPdfPath);

            // Configurar a conversão
            const pngPages = await pdfToPng(pdfBuffer, {
                disableFontFace: true, // Permite uso de fontes embutidas
                useSystemFonts: true,   // Permite uso de fontes do sistema
                viewportScale: 3.0,     // Aumenta a resolução (ajustado para 2x para melhor qualidade)
            });

            // Salvar as imagens geradas e criar a lista de caminhos
            const imagePaths: string[] = [];
            for (const page of pngPages) {
                const outputImagePath = path.join(outputDir, `page_${new Date().toISOString().replace(/[:.-]/g, '')}_${page.pageNumber}.png`);
                fs.writeFileSync(outputImagePath, page.content);
                imagePaths.push(outputImagePath);
            }

            return imagePaths;
        } catch (error) {
            console.error('Error converting PDF to images:', error);
            throw new Error('Failed to convert PDF to images');
        }
    }

    // Função para criar PDF a partir das imagens convertidas
    async createPdfFromImages(images: string[], outputPdfPath: string): Promise<void> {
        const pdfDoc = await pdfLib.PDFDocument.create();

        // Para cada imagem, adicione uma nova página no PDF
        for (const imagePath of images) {
            const imageBytes = fs.readFileSync(imagePath);  // Lê a imagem
            const image = await pdfDoc.embedPng(imageBytes);  // Carrega a imagem no PDF

            // Cria uma página com as dimensões da imagem
            const page = pdfDoc.addPage([image.width, image.height]);

            // Adiciona a imagem na página com as dimensões da própria imagem
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height
            });
        }

        // Salva o PDF gerado
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPdfPath, pdfBytes);
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            await fsPromisses.unlink(filePath);
        } catch (error) {
            console.error(`Erro ao excluir o arquivo: ${error.message}`);
        }
    }

    async deleteFiles(filePaths: string[]): Promise<void> {
        for (const filePath of filePaths) {
            try {
                await fsPromisses.unlink(filePath);
                console.log(`Arquivo ${filePath} excluído com sucesso.`);
            } catch (error) {
                console.error(`Erro ao excluir o arquivo ${filePath}: ${error.message}`);
            }
        }
    }

    async generateConvertedPdfPagesToImage(productData: GenerateProductPdf, fileNameToSave: string): Promise<PdfGenerationResult> {
        const generatedPdf = await this.generatePDFWithPdfMake(productData, fileNameToSave);
        const pdfImages = await this.convertPdfToImages(generatedPdf.path);
        await this.createPdfFromImages(pdfImages, getPath(`src/assets/temp/pdf-by-images/${fileNameToSave}`));

        return {
            createdFiles: [generatedPdf.path, ...pdfImages, `src/assets/temp/pdf-by-images/${fileNameToSave}`]
        }
    }

    async generatePDFWithPdfMake(productData: GenerateProductPdf, fileNameToSave: string) {
        const { product_name, product_image, segments, topics, table } = productData;
        const pdfPath = `src/assets/temp/doc/pdf/${fileNameToSave}`;
        const segmentIcons = {
            agricultura: await this.getImageBase64(getPath('src/assets/icon/plant.png')),
            tintas_e_resinas: await this.getImageBase64(getPath('src/assets/icon/color.png')),
            tratamento_de_agua: await this.getImageBase64(getPath('src/assets/icon/dropPlusLess.png')),
            cuidados_em_casa: await this.getImageBase64(getPath('src/assets/icon/cleanHands.png')),
        };
        // Leia e converta a imagem para base64, aguardando a Promise
        const logoAC = await this.getImageBase64(getPath('src/assets/img/logoAC.png'));
        // const tableTest = [
        //     ['Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5', 'Header 6', 'Header 7'],
        //     ['Text 1', 'Text 2', 'Text 3', 'Text 4', 'Text 5', 'Text 6', 'Text 7'],
        //     ['Text 1', 'Text 2', 'Text 3', 'Text 4', 'Text 5', 'Text sss ssss sss sss sss 6', 'Text 7'],
        //     ['Text 1', 'Text 2', 'Text 3', 'Text 4', 'Text 5', 'Text 6', 'Text 7'],
        //     ['Text 1', 'Text 2', 'Text 3', 'Text 4', 'Text 5', 'Text 6', 'Text 7'],
        // ];

        interface ModelfooterItem {
            icon: string;
            text: string;
            link?: string;  // Link é opcional
        }

        const footerItems: ModelfooterItem[] = [
            {
                icon: await this.getImageBase64(getPath('src/assets/icon/local.png')),
                text: 'Rua Funchal, 538, 2° andar, Itaim Bibi, São Paulo – SP, 04551-060',
                // link: 'https://g.co/kgs/xZqigYc',
            },
            {
                icon: await this.getImageBase64(getPath('src/assets/icon/whatsapp.png')),
                text: '11 9 1272-1893',
                // link: 'https://api.whatsapp.com/send/?phone=5511912721893&text=Ol%C3%A1%2C+tudo+certo%3F&type=phone_number&app_absent=0',
            },
            {
                icon: await this.getImageBase64(getPath('src/assets/icon/email.png')),
                text: 'ativachemical@ativachemical.com',
                // link: 'mailto:ativachemical@ativachemical.com',
            },
            {
                icon: await this.getImageBase64(getPath('src/assets/icon/internet.png')),
                text: 'www.ativachemical.com',
                // link: 'www.ativachemical.com',
            },
            {
                icon: await this.getImageBase64(getPath('src/assets/icon/linkedin.png')),
                text: 'https://www.linkedin.com/company/ativa-chemical',
            },
        ];

        // Filtra os ícones com base nos segmentos
        const selectedIcons = segments
            .map(segment => segmentIcons[segment])
            .filter(icon => icon); // Remove os undefined (caso algum segmento não tenha ícone)


        const quantityColunsInTable = 0;
        let test: any;
        switch (true) {
            case quantityColunsInTable > 11:
                test = [{
                    columns: [
                        {
                            style: 'tableExample',
                            layout: 'noBorders',
                            table: {
                                headerRows: 0, // Sem cabeçalho para essa tabela
                                body: footerItems.map(item => {
                                    // Verifica se o item possui a propriedade 'link' e, em caso afirmativo, adiciona a tag 'link' com a URL
                                    const textCell = {
                                        text: item.text,
                                        fontSize: 10,
                                        ...(item.link ? { link: item.link, color: '#4383f0' } : {}),
                                    };
                                    return [
                                        {
                                            image: item.icon,
                                            width: 12,
                                            height: 12,
                                            alignment: 'left',
                                        },
                                        {
                                            ...textCell,
                                            alignment: 'left',
                                            margin: [5, 0],
                                        },
                                    ];
                                }),
                            },
                            margin: [0, 70, 0, 0],  // Ajuste a margem conforme necessário
                        },
                    ],
                },
                {
                    text: `documento gerado em: ${currentDate()}`,
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 10, 0, 0],
                    color: '#bdbdbd'
                },                  // Forçar uma quebra de página antes de definir a orientação para a próxima página
                {
                    text: '',
                    style: 'header',
                    alignSegment: 'center',
                    pageBreak: 'before',
                    pageOrientation: 'landscape'
                },
                {
                    image: logoAC,
                    width: 200,
                    pageOrientation: 'landscape'
                },
                {
                    table: {
                        body: table // Usando a variável tableTest com os dados da tabela
                    },
                    layout: 'lightHorizontal', // Layout simples com linhas horizontais
                    margin: [0, 10, 0, 50], // Margens ajustadas conforme necessário
                },

                {
                    columns: [
                        {
                            style: 'tableExample',
                            layout: 'noBorders',
                            table: {
                                headerRows: 0, // Sem cabeçalho para essa tabela
                                body: footerItems.map(item => {
                                    // Verifica se o item possui a propriedade 'link' e, em caso afirmativo, adiciona a tag 'link' com a URL
                                    const textCell = {
                                        text: item.text,
                                        fontSize: 10,
                                        ...(item.link ? { link: item.link, color: '#4383f0' } : {}),
                                    };
                                    return [
                                        {
                                            image: item.icon,
                                            width: 12,
                                            height: 12,
                                            alignment: 'left',
                                        },
                                        {
                                            ...textCell,
                                            alignment: 'left',
                                            margin: [5, 0],
                                        },
                                    ];
                                }),
                            },
                            margin: [0, 70, 0, 0],  // Ajuste a margem conforme necessário
                        },
                    ],
                },
                {
                    text: `documento gerado em: ${currentDate()}`,
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 10, 0, 0],
                    color: '#bdbdbd'
                }
                ]
                break;
            case quantityColunsInTable < 11 && quantityColunsInTable >= 1:
                test = [{
                    text: 'Especificações',
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 15]
                },
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 'auto',
                            table: {
                                body: [
                                    // Corpo da tabela processado a partir do TSV, com negrito na primeira linha (header)
                                    ...table.map((row, rowIndex) =>
                                        row.map((cell, colIndex) => ({
                                            text: cell,
                                            style: rowIndex === 0 ? 'tableHeader' : 'tableCell', // Aplica 'tableHeader' para a primeira linha
                                            alignment: 'center',  // Centraliza as células, se necessário
                                            border: [true, true, true, true],  // Adiciona bordas visíveis
                                            color: '#404d63'  // Altera a cor do texto para branco
                                        }))
                                    ),
                                ]
                            },
                            layout: {
                                // Estilo zebra para alternar as cores das linhas
                                fillColor: function (rowIndex) {
                                    return (rowIndex % 2 === 0) ? '#ececec' : '#f7f7f7'; // Cor para linhas pares
                                },
                                hLineWidth: function (i, node) { return 1; }, // Linha horizontal
                                vLineWidth: function (i, node) { return 1; }, // Linha vertical
                                hLineColor: '#b3b4b6', // Cor branca para as linhas horizontais
                                vLineColor: '#b3b4b6', // Cor branca para as linhas verticais
                            },
                            margin: [0, 0, 0, 20],  // Margem abaixo da tabela
                        },
                        { width: '*', text: '' },
                    ]
                },
                {
                    columns: [
                        {
                            style: 'tableExample',
                            layout: 'noBorders',
                            table: {
                                headerRows: 0, // Sem cabeçalho para essa tabela
                                body: footerItems.map(item => {
                                    // Verifica se o item possui a propriedade 'link' e, em caso afirmativo, adiciona a tag 'link' com a URL
                                    const textCell = {
                                        text: item.text,
                                        fontSize: 10,
                                        ...(item.link ? { link: item.link, color: '#4383f0' } : {}),
                                    };
                                    return [
                                        {
                                            image: item.icon,
                                            width: 12,
                                            height: 12,
                                            alignment: 'left',
                                        },
                                        {
                                            ...textCell,
                                            alignment: 'left',
                                            margin: [5, 0],
                                        },
                                    ];
                                }),
                            },
                            margin: [0, 70, 0, 0],  // Ajuste a margem conforme necessário
                        },
                    ],
                },
                {
                    text: `documento gerado em: ${currentDate()}`,
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 10, 0, 0],
                    color: '#bdbdbd'
                }]
                break;
            case quantityColunsInTable <= 0:
                test = [
                    {
                        columns: [
                            {
                                style: 'tableExample',
                                layout: 'noBorders',
                                table: {
                                    headerRows: 0, // Sem cabeçalho para essa tabela
                                    body: footerItems.map(item => {
                                        // Verifica se o item possui a propriedade 'link' e, em caso afirmativo, adiciona a tag 'link' com a URL
                                        const textCell = {
                                            text: item.text,
                                            fontSize: 10,
                                            ...(item.link ? { link: item.link, color: '#4383f0' } : {}),
                                        };
                                        return [
                                            {
                                                image: item.icon,
                                                width: 12,
                                                height: 12,
                                                alignment: 'left',
                                            },
                                            {
                                                ...textCell,
                                                alignment: 'left',
                                                margin: [5, 0],
                                            },
                                        ];
                                    }),
                                },
                                margin: [0, 70, 0, 0],  // Ajuste a margem conforme necessário
                            },
                        ],
                    },
                    {
                        text: `documento gerado em: ${currentDate()}`,
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 10, 0, 0],
                        color: '#bdbdbd'
                    }]
                break;
        }
        // Defina o conteúdo do documento PDF
        const docDefinition = {
            pageMargins: [20, 20, 20, 20],
            styles: {
                normal: { font: 'Roboto', fontSize: 12 },
                bold: { font: 'Roboto', bold: true, fontSize: 12 },
                italics: { font: 'Roboto', italics: true, fontSize: 12 },
                bolditalics: { font: 'Roboto', bold: true, italics: true, fontSize: 12 },
            },
            content: [
                {
                    image: logoAC,
                    width: 200,
                },
                {
                    text: product_name,
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 10, 0, 0],
                },
                {
                    image: product_image,
                    width: 160,
                    alignment: 'center',
                    margin: [0, 5, 0, 2],
                },
                // Adiciona os ícones com espaço entre eles
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 'auto',
                            table: {
                                headerRows: 1,  // Define a primeira linha como cabeçalho
                                layout: 'noBorders',  // Remove todas as bordas da tabela
                                alignment: 'center',  // Alinha o conteúdo da tabela ao centro
                                body: [
                                    // Linha do cabeçalho com ícones
                                    [
                                        ...selectedIcons.map(icon => ({
                                            image: icon,
                                            width: 17,
                                            height: 17,
                                            margin: [2, 2], // Espaçamento entre os ícones
                                            border: [false, false, false, false] // Remove as bordas
                                        })),
                                    ]
                                ],
                            },
                            margin: [0, 0, 0, 20],
                        },
                        { width: '*', text: '' },
                    ]
                },
                {
                    stack: topics.map(topic => {
                        return [
                            { text: `${topic.key}:`, bold: true, fontSize: 14, margin: [0, 0, 0, 2] },
                            { text: topic.value, fontSize: 12, margin: [0, 0, 0, 15] },
                        ];
                    }),
                    alignment: 'left',
                },
                test
            ]
        };

        // Crie o PDF
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        // Salve o PDF no diretório desejado
        await this.savePdfToFile(pdfDocGenerator, pdfPath);

        return { message: 'PDF created successfully', path: pdfPath };
    }

    async getImageBase64(imagePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(imagePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`data:image/png;base64,${data.toString('base64')}`);
                }
            });
        });
    }

    async savePdfToFile(pdfDocGenerator: any, outputPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            pdfDocGenerator.getBuffer((buffer) => {
                fs.writeFile(outputPath, buffer, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }
}
