import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../database/schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/catalog.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    /** Tüm kategorileri ağaç yapısında döndür */
    async findAll(flat = false) {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .lean();

        if (flat) return categories;
        return this.buildTree(categories);
    }

    async findBySlug(slug: string): Promise<any> {
        const category = await this.categoryModel.findOne({ slug }).lean();
        if (!category) {
            throw new NotFoundException(`Kategori bulunamadı: ${slug}`);
        }

        // Alt kategorileri de getir
        const children = await this.categoryModel
            .find({ parentId: category._id, isActive: true })
            .sort({ sortOrder: 1 })
            .lean();

        return { ...category, children };
    }

    async findById(id: string) {
        const category = await this.categoryModel.findById(id).lean();
        if (!category) {
            throw new NotFoundException(`Kategori bulunamadı: ${id}`);
        }
        return category;
    }

    async create(dto: CreateCategoryDto) {
        const existing = await this.categoryModel.findOne({ slug: dto.slug });
        if (existing) {
            throw new ConflictException('Bu slug zaten kullanılıyor');
        }

        let ancestors: Types.ObjectId[] = [];
        let depth = 0;

        if (dto.parentId) {
            const parent = await this.categoryModel.findById(dto.parentId);
            if (!parent) {
                throw new NotFoundException('Üst kategori bulunamadı');
            }
            ancestors = [...(parent.ancestors || []), parent._id as Types.ObjectId];
            depth = (parent.depth || 0) + 1;
        }

        return this.categoryModel.create({
            ...dto,
            parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : undefined,
            ancestors,
            depth,
        });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        const updateData: Record<string, unknown> = { ...dto };

        if (dto.parentId) {
            const parent = await this.categoryModel.findById(dto.parentId);
            if (!parent) {
                throw new NotFoundException('Üst kategori bulunamadı');
            }
            updateData.parentId = new Types.ObjectId(dto.parentId);
            updateData.ancestors = [...(parent.ancestors || []), parent._id];
            updateData.depth = (parent.depth || 0) + 1;
        }

        const category = await this.categoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true },
        );

        if (!category) {
            throw new NotFoundException(`Kategori bulunamadı: ${id}`);
        }
        return category;
    }

    async remove(id: string) {
        // Alt kategorileri kontrol et
        const children = await this.categoryModel.find({ parentId: id });
        if (children.length > 0) {
            throw new ConflictException(
                'Bu kategorinin alt kategorileri var. Önce onları silin.',
            );
        }

        const category = await this.categoryModel.findByIdAndDelete(id);
        if (!category) {
            throw new NotFoundException(`Kategori bulunamadı: ${id}`);
        }
        return { deleted: true, slug: category.slug };
    }

    /** Breadcrumb — kök'ten hedefe kadar yol */
    async getBreadcrumb(id: string) {
        const category = await this.categoryModel.findById(id).lean();
        if (!category) return [];

        const ancestorIds = category.ancestors || [];
        const ancestors = await this.categoryModel
            .find({ _id: { $in: ancestorIds } })
            .sort({ depth: 1 })
            .select('name slug depth')
            .lean();

        return [...ancestors, { _id: category._id, name: category.name, slug: category.slug, depth: category.depth }];
    }

    /** Flat listeden ağaç yapısı oluştur */
    private buildTree(categories: any[]): any[] {
        const map = new Map<string, any>();
        const tree: any[] = [];

        categories.forEach((cat) => {
            map.set(cat._id.toString(), { ...cat, children: [] });
        });

        categories.forEach((cat) => {
            const node = map.get(cat._id.toString());
            if (cat.parentId) {
                const parent = map.get(cat.parentId.toString());
                if (parent) {
                    parent.children.push(node);
                } else {
                    tree.push(node);
                }
            } else {
                tree.push(node);
            }
        });

        return tree;
    }
}
