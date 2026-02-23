import {
    Controller, Post, Delete, Param, Body,
    UploadedFile, UploadedFiles, UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
@Roles('super_admin', 'admin')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Tek dosya yükle' })
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Dosya gerekli');
        if (!this.mediaService.isAllowedMimeType(file.mimetype)) {
            throw new BadRequestException('Desteklenmeyen dosya türü');
        }
        if (!this.mediaService.isAllowedSize(file.size)) {
            throw new BadRequestException('Dosya boyutu 10MB\'ı aşamaz');
        }

        return this.mediaService.uploadFile(file.buffer, file.originalname, file.mimetype);
    }

    @Post('upload/multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Çoklu dosya yükle (max 10)' })
    async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files?.length) throw new BadRequestException('En az 1 dosya gerekli');

        const validated = files.map((f) => {
            if (!this.mediaService.isAllowedMimeType(f.mimetype)) {
                throw new BadRequestException(`Desteklenmeyen: ${f.originalname}`);
            }
            if (!this.mediaService.isAllowedSize(f.size)) {
                throw new BadRequestException(`Çok büyük: ${f.originalname}`);
            }
            return { buffer: f.buffer, originalName: f.originalname, mimeType: f.mimetype };
        });

        return this.mediaService.uploadMultiple(validated);
    }

    @Delete(':key')
    @ApiOperation({ summary: 'Dosya sil' })
    async deleteFile(@Param('key') key: string) {
        await this.mediaService.deleteFile(key);
        return { deleted: true };
    }
}
