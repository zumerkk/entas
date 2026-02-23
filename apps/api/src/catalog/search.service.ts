import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../database/schemas/product.schema';

export interface SearchResult {
    data: any[];
    total: number;
    query: string;
    engine: 'atlas_search' | 'text_index';
}

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    /**
     * Ürün arama — Atlas Search varsa aggregate pipeline kullanır,
     * yoksa MongoDB text index'e fallback yapar.
     */
    async searchProducts(
        query: string,
        options: {
            limit?: number;
            page?: number;
            categoryId?: string;
            brandId?: string;
            minPrice?: number;
            maxPrice?: number;
        } = {},
    ): Promise<SearchResult> {
        const { limit = 20, page = 1 } = options;

        try {
            // Atlas Search aggregate pipeline deneyelim
            return await this.atlasSearch(query, options);
        } catch {
            // Atlas Search yoksa text index fallback
            this.logger.warn('Atlas Search kullanılamadı, text index fallback');
            return this.textIndexSearch(query, options);
        }
    }

    /** Atlas Search (MongoDB Atlas) */
    private async atlasSearch(
        query: string,
        options: any,
    ): Promise<SearchResult> {
        const { limit = 20, page = 1, categoryId, brandId, minPrice, maxPrice } = options;
        const skip = (page - 1) * limit;

        const pipeline: any[] = [
            {
                $search: {
                    index: 'products_search',
                    compound: {
                        should: [
                            {
                                text: {
                                    query,
                                    path: ['title', 'shortDescription', 'tags'],
                                    fuzzy: { maxEdits: 1 },
                                    score: { boost: { value: 3 } },
                                },
                            },
                            {
                                text: {
                                    query,
                                    path: 'sku',
                                    score: { boost: { value: 5 } },
                                },
                            },
                        ],
                        minimumShouldMatch: 1,
                    },
                },
            },
            { $match: { isActive: true } },
        ];

        // Filtreler
        const matchStage: Record<string, unknown> = {};
        if (categoryId) matchStage.categoryIds = { $oid: categoryId };
        if (brandId) matchStage.brandId = { $oid: brandId };
        if (minPrice || maxPrice) {
            matchStage.basePrice = {};
            if (minPrice) (matchStage.basePrice as any).$gte = minPrice;
            if (maxPrice) (matchStage.basePrice as any).$lte = maxPrice;
        }
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            { $addFields: { score: { $meta: 'searchScore' } } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    total: [{ $count: 'count' }],
                },
            },
        );

        const [result] = await this.productModel.aggregate(pipeline);
        const total = result.total[0]?.count || 0;

        return {
            data: result.data,
            total,
            query,
            engine: 'atlas_search',
        };
    }

    /** Text Index Fallback (yerelde çalışır) */
    private async textIndexSearch(
        query: string,
        options: any,
    ): Promise<SearchResult> {
        const { limit = 20, page = 1, categoryId, brandId, minPrice, maxPrice } = options;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {
            $text: { $search: query },
            isActive: true,
        };

        if (categoryId) filter.categoryIds = categoryId;
        if (brandId) filter.brandId = brandId;
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) (filter.basePrice as any).$gte = minPrice;
            if (maxPrice) (filter.basePrice as any).$lte = maxPrice;
        }

        const [data, total] = await Promise.all([
            this.productModel
                .find(filter, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(limit)
                .populate('brandId', 'name slug')
                .lean(),
            this.productModel.countDocuments(filter),
        ]);

        return { data, total, query, engine: 'text_index' };
    }

    /** Otomatik tamamlama önerileri */
    async suggest(prefix: string, limit = 5) {
        // Regex ile başlangıç eşleştirmesi (Atlas Autocomplete yoksa)
        const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        const products = await this.productModel
            .find({ title: regex, isActive: true })
            .select('title slug sku images')
            .limit(limit)
            .lean();

        return products.map((p) => ({
            title: p.title,
            slug: p.slug,
            sku: p.sku,
            thumbnail: p.images?.[0]?.url,
        }));
    }
}
