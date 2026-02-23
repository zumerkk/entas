import {
    Controller, Get, Post, Put, Delete,
    Body, Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/catalog.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Marka listesi' })
    findAll() {
        return this.brandsService.findAll();
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Marka detayı (slug)' })
    findBySlug(@Param('slug') slug: string) {
        return this.brandsService.findBySlug(slug);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Marka detayı (ID)' })
    findById(@Param('id') id: string) {
        return this.brandsService.findById(id);
    }

    @Post()
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Marka oluştur' })
    create(@Body() dto: CreateBrandDto) {
        return this.brandsService.create(dto);
    }

    @Put(':id')
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Marka güncelle' })
    update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
        return this.brandsService.update(id, dto);
    }

    @Delete(':id')
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Marka sil' })
    remove(@Param('id') id: string) {
        return this.brandsService.remove(id);
    }
}
