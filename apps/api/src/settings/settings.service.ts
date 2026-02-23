import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from '../database/schemas/system.schema';
import { FeatureFlag, FeatureFlagDocument } from '../database/schemas/system.schema';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
        @InjectModel(FeatureFlag.name) private flagModel: Model<FeatureFlagDocument>,
    ) { }

    // ─── Settings ───
    async getAllSettings() {
        return this.settingModel.find().sort({ key: 1 }).lean();
    }

    async getSetting(key: string) {
        const setting = await this.settingModel.findOne({ key }).lean();
        if (!setting) throw new NotFoundException(`Ayar bulunamadı: ${key}`);
        return setting;
    }

    async getSettingValue<T = string>(key: string, defaultValue?: T): Promise<T> {
        const setting = await this.settingModel.findOne({ key }).lean();
        return setting ? (setting.value as T) : (defaultValue as T);
    }

    async upsertSetting(key: string, value: any, description?: string, type?: string) {
        return this.settingModel.findOneAndUpdate(
            { key },
            { value, description, type: type || typeof value },
            { new: true, upsert: true },
        );
    }

    async deleteSetting(key: string) {
        const result = await this.settingModel.findOneAndDelete({ key });
        if (!result) throw new NotFoundException(`Ayar bulunamadı: ${key}`);
        return { deleted: true };
    }

    // ─── Feature Flags ───
    async getAllFlags() {
        return this.flagModel.find().sort({ key: 1 }).lean();
    }

    async getFlag(key: string) {
        const flag = await this.flagModel.findOne({ key }).lean();
        if (!flag) return { key, enabled: false };
        return flag;
    }

    async isEnabled(key: string): Promise<boolean> {
        const flag = await this.flagModel.findOne({ key }).lean();
        return flag?.enabled ?? false;
    }

    async upsertFlag(key: string, enabled: boolean, description?: string, metadata?: Record<string, any>) {
        return this.flagModel.findOneAndUpdate(
            { key },
            { enabled, description, metadata },
            { new: true, upsert: true },
        );
    }

    async deleteFlag(key: string) {
        const result = await this.flagModel.findOneAndDelete({ key });
        if (!result) throw new NotFoundException(`Flag bulunamadı: ${key}`);
        return { deleted: true };
    }
}
