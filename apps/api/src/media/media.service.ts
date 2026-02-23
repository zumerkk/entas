import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

export interface UploadResult {
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
}

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private readonly uploadDir: string;
    private readonly baseUrl: string;

    constructor(private configService: ConfigService) {
        this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
        this.baseUrl = this.configService.get<string>('MEDIA_BASE_URL', '/uploads');

        // Upload dizinini oluştur
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Dosya yükleme — local filesystem (production'da MinIO/S3 kullanılır)
     */
    async uploadFile(
        buffer: Buffer,
        originalName: string,
        mimeType: string,
    ): Promise<UploadResult> {
        const ext = path.extname(originalName);
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const key = `${Date.now()}-${hash}${ext}`;

        // Alt dizinle organize et — YYYY/MM/
        const now = new Date();
        const subDir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
        const fullDir = path.join(this.uploadDir, subDir);

        if (!fs.existsSync(fullDir)) {
            fs.mkdirSync(fullDir, { recursive: true });
        }

        const filePath = path.join(fullDir, key);
        fs.writeFileSync(filePath, buffer);

        const url = `${this.baseUrl}/${subDir}/${key}`;

        this.logger.log(`Dosya yüklendi: ${originalName} → ${url} (${buffer.length} bytes)`);

        return {
            key: `${subDir}/${key}`,
            url,
            originalName,
            mimeType,
            size: buffer.length,
        };
    }

    /** Çoklu dosya yükleme */
    async uploadMultiple(
        files: { buffer: Buffer; originalName: string; mimeType: string }[],
    ): Promise<UploadResult[]> {
        return Promise.all(
            files.map((f) => this.uploadFile(f.buffer, f.originalName, f.mimeType)),
        );
    }

    /** Dosya silme */
    async deleteFile(key: string): Promise<void> {
        const filePath = path.join(this.uploadDir, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            this.logger.log(`Dosya silindi: ${key}`);
        }
    }

    /** Resim optimize ayarları (production'da sharp kullanılır) */
    getImageVariants(originalKey: string) {
        return {
            original: `${this.baseUrl}/${originalKey}`,
            thumbnail: `${this.baseUrl}/thumb/${originalKey}`,
            medium: `${this.baseUrl}/medium/${originalKey}`,
            large: `${this.baseUrl}/large/${originalKey}`,
        };
    }

    /** Allowed MIME types kontrolü */
    isAllowedMimeType(mimeType: string): boolean {
        const allowed = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
            'application/pdf',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
        ];
        return allowed.includes(mimeType);
    }

    /** Max file size kontrolü */
    isAllowedSize(size: number, maxMb = 10): boolean {
        return size <= maxMb * 1024 * 1024;
    }
}
