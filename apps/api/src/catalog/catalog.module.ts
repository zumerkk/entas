import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
    controllers: [
        ProductsController,
        CategoriesController,
        BrandsController,
        SearchController,
    ],
    providers: [
        ProductsService,
        CategoriesService,
        BrandsService,
        SearchService,
    ],
    exports: [ProductsService, CategoriesService, BrandsService, SearchService],
})
export class CatalogModule { }
