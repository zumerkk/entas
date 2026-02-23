import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// ─── Pagination ───
export class PaginationQueryDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}

// ─── Product DTOs ───
export class ProductFilterDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isFeatured?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tag?: string;
}

export class CreateProductDto {
    @ApiProperty({ example: 'ENT-00001' })
    @IsString()
    sku: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty({ example: 'Profesyonel Çekiç 500g' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'profesyonel-cekic-500g' })
    @IsString()
    slug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    shortDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoryIds?: string[];

    @ApiProperty({ example: 149.90 })
    @IsNumber()
    @Min(0)
    basePrice: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsNumber()
    vatRate?: number;

    @ApiPropertyOptional({ default: 'adet' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    minOrderQuantity?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    packSize?: number;

    @ApiPropertyOptional()
    @IsOptional()
    quantityBreaks?: { minQty: number; price: number }[];

    @ApiPropertyOptional()
    @IsOptional()
    attributes?: Record<string, string | number | boolean>;

    @ApiPropertyOptional()
    @IsOptional()
    images?: { url: string; alt: string; sortOrder?: number; isThumbnail?: boolean }[];

    @ApiPropertyOptional()
    @IsOptional()
    seo?: { title?: string; description?: string; keywords?: string[] };

    @ApiPropertyOptional()
    @IsOptional()
    dimensions?: { weight?: number; width?: number; height?: number; depth?: number };

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    hidePriceForGuests?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) { }

// ─── Category DTOs ───
export class CreateCategoryDto {
    @ApiProperty({ example: 'El Aletleri' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'el-aletleri' })
    @IsString()
    slug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    seo?: { title?: string; description?: string; keywords?: string[] };

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

// ─── Brand DTOs ───
export class CreateBrandDto {
    @ApiProperty({ example: 'Bosch' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'bosch' })
    @IsString()
    slug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    sortOrder?: number;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) { }
