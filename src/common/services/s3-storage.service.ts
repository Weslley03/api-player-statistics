import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

@Injectable()
export class S3StorageService {
  private readonly client: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    })
    this.bucket = this.configService.get<string>('S3_BUCKET')!
  }

  async uploadAvatar(playerId: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `user-avatar/${playerId}.png`,
        Body: buffer,
        ContentType: mimeType,
      }),
    )
  }

  async listClubKeys(): Promise<string[]> {
    const response = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: 'club/' }))

    return (response.Contents ?? [])
      .map((obj) => obj.Key ?? '')
      .filter((key) => key.length > 0)
      .map((key) => key.replace(/^club\//, '').replace(/\.svg$/, ''))
      .filter((key) => key.length > 0)
  }
}
