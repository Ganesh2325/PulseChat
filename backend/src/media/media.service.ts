import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StorageProvider } from './storage/storage.interface';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly storage: StorageProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'local');
    if (provider === 'local') {
      const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
      this.storage = new LocalStorageProvider(uploadDir);
    } else {
      this.storage = new LocalStorageProvider('./uploads');
    }
    this.logger.log(`Storage provider: ${provider}`);
  }

  async upload(userId: string, file: Express.Multer.File) {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    const url = await this.storage.save(filename, file.buffer);

    const media = await this.prisma.mediaFile.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        uploadedById: userId,
      },
    });

    this.logger.log(`File uploaded: ${filename} by ${userId}`);
    return media;
  }

  async delete(fileId: string) {
    const file = await this.prisma.mediaFile.findUnique({ where: { id: fileId } });
    if (file) {
      await this.storage.delete(file.filename);
      await this.prisma.mediaFile.delete({ where: { id: fileId } });
    }
  }
}
