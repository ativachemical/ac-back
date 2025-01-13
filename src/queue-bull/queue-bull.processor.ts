import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ProductService } from '../product/product.service'; // Importando o ProductService

@Processor('generate-pdf-email') // Nome da fila
export class QueueBullProcessor {
  constructor(private readonly productService: ProductService) {}

  @Process()
  async handleGeneratePdfJob(job: Job) {
    const { downloadType, informationDownloadProduct, productDataForPdf } = job.data;

    // Chama a função existente no ProductService
    await this.productService.generatePdfProductAndSendByEmail(
      downloadType,
      informationDownloadProduct,
      productDataForPdf,
    );

    console.log('Job de geração de PDF e envio de e-mail concluído.');
  }
}
