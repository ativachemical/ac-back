import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GenerateProductPdf } from 'src/file-manager/dto/generate-product-pdf';
import { DownloadProductQueryDto, InformationDownloadProductRequest } from 'src/product/dto/information -download-product-request';

@Injectable()
export class QueueBullService {
  constructor(@InjectQueue('generate-pdf-email') private readonly queue: Queue) {}

  async addGeneratePdfJob(
    downloadType: DownloadProductQueryDto,
    informationDownloadProduct: InformationDownloadProductRequest,
    productDataForPdf: GenerateProductPdf,
  ) {
    const jobData = { downloadType, informationDownloadProduct, productDataForPdf };

    // Adiciona o job à fila e retorna imediatamente ao cliente
    const job = await this.queue.add(jobData, {
      attempts: 1, // Número de tentativas em caso de falha
      backoff: 5000, // Tempo de espera entre as tentativas
      removeOnComplete: true, // Remove o trabalho ao ser concluído
    });

    console.log('Job adicionado à fila generate-pdf-email:', job.id);

    // Retorna o ID do job imediatamente
    return { message: 'Job de geração de PDF e envio de e-mail iniciado', jobId: job.id }; 
  }
}
