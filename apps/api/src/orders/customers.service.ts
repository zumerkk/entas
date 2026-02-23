import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Customer, CustomerDocument } from '../database/schemas/customer.schema';
import { CustomerGroup, CustomerGroupDocument } from '../database/schemas/customer-group.schema';

@Injectable()
export class CustomersService {
    constructor(
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerGroup.name) private groupModel: Model<CustomerGroupDocument>,
    ) { }

    async findAll(page = 1, limit = 20, search?: string) {
        const query: FilterQuery<CustomerDocument> = {};
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { accountCode: { $regex: search, $options: 'i' } },
                { taxNumber: search },
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.customerModel
                .find(query)
                .sort({ companyName: 1 })
                .skip(skip)
                .limit(limit)
                .populate('groupId', 'name discountPercent')
                .populate('salesRepId', 'firstName lastName email')
                .lean(),
            this.customerModel.countDocuments(query),
        ]);
        return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async findById(id: string) {
        const customer = await this.customerModel
            .findById(id)
            .populate('groupId', 'name discountPercent priceListId')
            .populate('salesRepId', 'firstName lastName email')
            .lean();
        if (!customer) throw new NotFoundException('Müşteri bulunamadı');
        return customer;
    }

    async create(dto: Partial<Customer>) {
        if (dto.accountCode) {
            const existing = await this.customerModel.findOne({ accountCode: dto.accountCode });
            if (existing) throw new ConflictException('Bu cari kodu zaten kullanılıyor');
        }
        return this.customerModel.create(dto);
    }

    async update(id: string, dto: Partial<Customer>) {
        const customer = await this.customerModel.findByIdAndUpdate(id, dto, {
            new: true,
            runValidators: true,
        });
        if (!customer) throw new NotFoundException('Müşteri bulunamadı');
        return customer;
    }

    async remove(id: string) {
        const customer = await this.customerModel.findByIdAndDelete(id);
        if (!customer) throw new NotFoundException('Müşteri bulunamadı');
        return { deleted: true };
    }

    // ─── Müşteri Grupları ───
    async findAllGroups() {
        return this.groupModel.find({ isActive: true }).sort({ name: 1 }).lean();
    }

    async createGroup(dto: Partial<CustomerGroup>) {
        return this.groupModel.create(dto);
    }

    async updateGroup(id: string, dto: Partial<CustomerGroup>) {
        const group = await this.groupModel.findByIdAndUpdate(id, dto, { new: true });
        if (!group) throw new NotFoundException('Grup bulunamadı');
        return group;
    }

    async removeGroup(id: string) {
        // Grupta müşteri var mı kontrol et
        const count = await this.customerModel.countDocuments({ groupId: new Types.ObjectId(id) });
        if (count > 0) throw new ConflictException(`Bu grupta ${count} müşteri var`);
        const group = await this.groupModel.findByIdAndDelete(id);
        if (!group) throw new NotFoundException('Grup bulunamadı');
        return { deleted: true };
    }
}
