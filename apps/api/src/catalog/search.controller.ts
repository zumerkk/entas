import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Ürün arama (Atlas Search / text index)' })
    @ApiQuery({ name: 'q', required: true, description: 'Arama sorgusu' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'brandId', required: false })
    @ApiQuery({ name: 'minPrice', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    search(
        @Query('q') q: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('categoryId') categoryId?: string,
        @Query('brandId') brandId?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ) {
        return this.searchService.searchProducts(q, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            categoryId,
            brandId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        });
    }

    @Public()
    @Get('suggest')
    @ApiOperation({ summary: 'Otomatik tamamlama önerileri' })
    @ApiQuery({ name: 'q', required: true })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    suggest(
        @Query('q') q: string,
        @Query('limit') limit?: string,
    ) {
        return this.searchService.suggest(q, limit ? parseInt(limit, 10) : 5);
    }
}
