import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Promotion, PromotionDocument } from '../database/schemas/promotion.schema';
import { Coupon, CouponDocument } from '../database/schemas/promotion.schema';

@Injectable()
export class PromotionsService {
    constructor(
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
        @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    ) { }

    // ─── Promosyonlar ───
    async findAllPromotions(page = 1, limit = 20, isActive?: boolean) {
        const query: FilterQuery<PromotionDocument> = {};
        if (isActive !== undefined) query.isActive = isActive;

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.promotionModel.find(query).sort({ priority: -1, createdAt: -1 })
                .skip(skip).limit(limit).lean(),
            this.promotionModel.countDocuments(query),
        ]);
        return { data, pagination: { page, limit, total } };
    }

    async findPromotionById(id: string) {
        const promo = await this.promotionModel.findById(id).lean();
        if (!promo) throw new NotFoundException('Promosyon bulunamadı');
        return promo;
    }

    async createPromotion(dto: Partial<Promotion>) {
        return this.promotionModel.create(dto);
    }

    async updatePromotion(id: string, dto: Partial<Promotion>) {
        const promo = await this.promotionModel.findByIdAndUpdate(id, dto, { new: true });
        if (!promo) throw new NotFoundException('Promosyon bulunamadı');
        return promo;
    }

    async removePromotion(id: string) {
        // İlişkili kuponları kontrol et
        const couponCount = await this.couponModel.countDocuments({ promotionId: id });
        if (couponCount > 0) {
            throw new ConflictException(`Bu promosyona bağlı ${couponCount} kupon var`);
        }
        const promo = await this.promotionModel.findByIdAndDelete(id);
        if (!promo) throw new NotFoundException('Promosyon bulunamadı');
        return { deleted: true };
    }

    /** Aktif promosyonları ürün/kategori/marka bazında getir */
    async getApplicablePromotions(productId?: string, categoryId?: string, brandId?: string) {
        const now = new Date();
        const query: FilterQuery<PromotionDocument> = {
            isActive: true,
            $or: [
                { validFrom: null, validTo: null },
                { validFrom: { $lte: now }, validTo: { $gte: now } },
                { validFrom: { $lte: now }, validTo: null },
            ],
        };

        const promotions = await this.promotionModel.find(query).sort({ priority: -1 }).lean();

        // Filtrele: ürün/kategori/marka eşleşmesi
        return promotions.filter((p: any) => {
            if (p.applicableProducts?.length && productId) {
                return p.applicableProducts.some((id: any) => id.toString() === productId);
            }
            if (p.applicableCategories?.length && categoryId) {
                return p.applicableCategories.some((id: any) => id.toString() === categoryId);
            }
            if (p.applicableBrands?.length && brandId) {
                return p.applicableBrands.some((id: any) => id.toString() === brandId);
            }
            if (!p.applicableProducts?.length && !p.applicableCategories?.length && !p.applicableBrands?.length) {
                return true;
            }
            return false;
        });
    }

    // ─── Kuponlar ───
    async findAllCoupons(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.couponModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('promotionId', 'name type').lean(),
            this.couponModel.countDocuments(),
        ]);
        return { data, pagination: { page, limit, total } };
    }

    async createCoupon(dto: Partial<Coupon>) {
        const existing = await this.couponModel.findOne({ code: (dto.code as string)?.toUpperCase() });
        if (existing) throw new ConflictException('Bu kupon kodu zaten var');
        return this.couponModel.create({ ...dto, code: (dto.code as string)?.toUpperCase() });
    }

    async validateCoupon(code: string, customerId?: string) {
        const coupon = await this.couponModel.findOne({
            code: code.toUpperCase(),
            isActive: true,
        }).populate('promotionId').lean();

        if (!coupon) return { valid: false, reason: 'Kupon bulunamadı' };

        const now = new Date();
        if ((coupon as any).expiresAt && now > (coupon as any).expiresAt) return { valid: false, reason: 'Kupon süresi dolmuş' };
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, reason: 'Kullanım limiti doldu' };

        return { valid: true, coupon };
    }

    async useCoupon(code: string) {
        await this.couponModel.updateOne(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } },
        );
    }
}
