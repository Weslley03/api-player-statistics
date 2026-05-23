import { Global, Module } from '@nestjs/common'
import { S3StorageService } from '../common/services/s3-storage.service'
import { S3UrlService } from '../common/services/s3-url.service'
import { WhatsAppService } from './services/whatsapp.service'

@Global()
@Module({
  providers: [S3UrlService, S3StorageService, WhatsAppService],
  exports: [S3UrlService, S3StorageService, WhatsAppService],
})
export class SharedModule {}
