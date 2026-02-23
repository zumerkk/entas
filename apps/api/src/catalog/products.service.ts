import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/catalog.dto';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async findAll(filter: ProductFilterDto) {
        const {
            page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
            search, categoryId, brandId, minPrice, maxPrice,
            isActive, isFeatured, tag,
        } = filter;

        const query: FilterQuery<ProductDocument> = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (categoryId) {
            query.categoryIds = new Types.ObjectId(categoryId);
        }
        if (brandId) {
            query.brandId = new Types.ObjectId(brandId);
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.basePrice = {};
            if (minPrice !== undefined) query.basePrice.$gte = minPrice;
            if (maxPrice !== undefined) query.basePrice.$lte = maxPrice;
        }
        if (isActive !== undefined) {
            query.isActive = isActive;
        }
        if (isFeatured !== undefined) {
            query.isFeatured = isFeatured;
        }
        if (tag) {
            query.tags = tag;
        }

        const skip = (page - 1) * limit;
        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            this.productModel
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('brandId', 'name slug logo')
                .populate('categoryIds', 'name slug')
                .lean(),
            this.productModel.countDocuments(query),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        };
    }

    async findBySlug(slug: string) {
        const product = await this.productModel
            .findOne({ slug })
            .populate('brandId', 'name slug logo')
            .populate('categoryIds', 'name slug')
            .lean();

        if (!product) {
            throw new NotFoundException(`Ürün bulunamadı: ${slug}`);
        }
        return product;
    }

    async findById(id: string) {
        const product = await this.productModel
            .findById(id)
            .populate('brandId', 'name slug logo')
            .populate('categoryIds', 'name slug')
            .lean();

        if (!product) {
            throw new NotFoundException(`Ürün bulunamadı: ${id}`);
        }
        return product;
    }

    async create(dto: CreateProductDto) {
        const existing = await this.productModel.findOne({
            $or: [{ sku: dto.sku }, { slug: dto.slug }],
        });
        if (existing) {
            throw new ConflictException('Bu SKU veya slug zaten kullanılıyor');
        }

        const product = await this.productModel.create({
            ...dto,
            brandId: dto.brandId ? new Types.ObjectId(dto.brandId) : undefined,
            categoryIds: dto.categoryIds?.map((id) => new Types.ObjectId(id)),
        });

        this.logger.log(`Ürün oluşturuldu: ${product.sku}`);
        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        const updateData: Record<string, unknown> = { ...dto };

        if (dto.brandId) {
            updateData.brandId = new Types.ObjectId(dto.brandId);
        }
        if (dto.categoryIds) {
            updateData.categoryIds = dto.categoryIds.map((cid) => new Types.ObjectId(cid));
        }

        const product = await this.productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true },
        );

        if (!product) {
            throw new NotFoundException(`Ürün bulunamadı: ${id}`);
        }

        this.logger.log(`Ürün güncellendi: ${product.sku}`);
        return product;
    }

    async remove(id: string) {
        const product = await this.productModel.findByIdAndDelete(id);
        if (!product) {
            throw new NotFoundException(`Ürün bulunamadı: ${id}`);
        }
        this.logger.log(`Ürün silindi: ${product.sku}`);
        return { deleted: true, sku: product.sku };
    }

    async findBySku(sku: string) {
        return this.productModel.findOne({ sku: sku.toUpperCase() }).lean();
    }

    async bulkUpdatePrices(updates: { productId: string; basePrice: number }[]) {
        const ops = updates.map((u) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(u.productId) },
                update: { $set: { basePrice: u.basePrice } },
            },
        }));
        const result = await this.productModel.bulkWrite(ops);
        this.logger.log(`Toplu fiyat güncellemesi: ${result.modifiedCount} ürün`);
        return { modifiedCount: result.modifiedCount };
    }
}
