import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../database/schemas/brand.schema';
import { CreateBrandDto, UpdateBrandDto } from './dto/catalog.dto';

@Injectable()
export class BrandsService {
    constructor(
        @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    ) { }

    async findAll() {
        return this.brandModel
            .find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .lean();
    }

    async findBySlug(slug: string) {
        const brand = await this.brandModel.findOne({ slug }).lean();
        if (!brand) {
            throw new NotFoundException(`Marka bulunamadı: ${slug}`);
        }
        return brand;
    }

    async findById(id: string) {
        const brand = await this.brandModel.findById(id).lean();
        if (!brand) {
            throw new NotFoundException(`Marka bulunamadı: ${id}`);
        }
        return brand;
    }

    async create(dto: CreateBrandDto) {
        const existing = await this.brandModel.findOne({ slug: dto.slug });
        if (existing) {
            throw new ConflictException('Bu slug zaten kullanılıyor');
        }
        return this.brandModel.create(dto);
    }

    async update(id: string, dto: UpdateBrandDto) {
        const brand = await this.brandModel.findByIdAndUpdate(
            id,
            dto,
            { new: true, runValidators: true },
        );
        if (!brand) {
            throw new NotFoundException(`Marka bulunamadı: ${id}`);
        }
        return brand;
    }

    async remove(id: string) {
        const brand = await this.brandModel.findByIdAndDelete(id);
        if (!brand) {
            throw new NotFoundException(`Marka bulunamadı: ${id}`);
        }
        return { deleted: true, slug: brand.slug };
    }
}
