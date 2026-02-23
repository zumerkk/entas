import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/catalog.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Kategori ağacı' })
    @ApiQuery({ name: 'flat', required: false, type: Boolean })
    findAll(@Query('flat') flat?: string) {
        return this.categoriesService.findAll(flat === 'true');
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Kategori detayı (slug) + alt kategoriler' })
    findBySlug(@Param('slug') slug: string): Promise<any> {
        return this.categoriesService.findBySlug(slug);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Kategori detayı (ID)' })
    findById(@Param('id') id: string) {
        return this.categoriesService.findById(id);
    }

    @Public()
    @Get(':id/breadcrumb')
    @ApiOperation({ summary: 'Breadcrumb — kökten hedefe yol' })
    getBreadcrumb(@Param('id') id: string) {
        return this.categoriesService.getBreadcrumb(id);
    }

    @Post()
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kategori oluştur' })
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Put(':id')
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kategori güncelle' })
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kategori sil' })
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
