import {
    Controller, Get, Post, Param, Body, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ImportService } from './import.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Import')
@Controller('import')
@ApiBearerAuth()
@Roles('super_admin', 'admin')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('product')
    @ApiOperation({ summary: 'Toplu ürün import başlat' })
    async importProducts(
        @Body() body: { fileName: string; fileSize: number; rows: any[]; fileHash?: string },
        @CurrentUser('userId') userId: string,
    ) {
        const { job, duplicate, existingJob } = await this.importService.createJob(
            body.fileName, body.fileSize, 'product', userId, body.fileHash,
        ) as any;
        if (duplicate) return { duplicate: true, existingJob };

        const result = await this.importService.processProductImport(
            job._id.toString(), body.rows,
        );
        return result;
    }

    @Post('stock')
    @ApiOperation({ summary: 'Toplu stok import başlat' })
    async importStock(
        @Body() body: { fileName: string; fileSize: number; rows: any[]; fileHash?: string },
        @CurrentUser('userId') userId: string,
    ) {
        const { job, duplicate, existingJob } = await this.importService.createJob(
            body.fileName, body.fileSize, 'stock', userId, body.fileHash,
        ) as any;
        if (duplicate) return { duplicate: true, existingJob };

        return this.importService.processStockImport(job._id.toString(), body.rows);
    }

    @Get('jobs')
    @ApiOperation({ summary: 'Import job listesi' })
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.importService.findAll(page ? +page : 1, limit ? +limit : 20);
    }

    @Get('jobs/:id')
    @ApiOperation({ summary: 'Import job detayı + hatalar' })
    findById(@Param('id') id: string): Promise<any> {
        return this.importService.findById(id);
    }
}
