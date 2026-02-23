import {
    Controller, Get, Put, Delete,
    Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Settings')
@Controller('settings')
@ApiBearerAuth()
@Roles('super_admin', 'admin')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Tüm ayarlar' })
    getAll() {
        return this.settingsService.getAllSettings();
    }

    @Get(':key')
    @ApiOperation({ summary: 'Ayar değeri' })
    get(@Param('key') key: string) {
        return this.settingsService.getSetting(key);
    }

    @Put(':key')
    @ApiOperation({ summary: 'Ayar güncelle/oluştur' })
    upsert(@Param('key') key: string, @Body() body: { value: any; description?: string; type?: string }) {
        return this.settingsService.upsertSetting(key, body.value, body.description, body.type);
    }

    @Delete(':key')
    @ApiOperation({ summary: 'Ayar sil' })
    remove(@Param('key') key: string) {
        return this.settingsService.deleteSetting(key);
    }

    // ─── Feature Flags ───
    @Get('flags/all')
    @ApiOperation({ summary: 'Tüm feature flags' })
    getAllFlags() {
        return this.settingsService.getAllFlags();
    }

    @Get('flags/:key')
    @ApiOperation({ summary: 'Feature flag değeri' })
    getFlag(@Param('key') key: string) {
        return this.settingsService.getFlag(key);
    }

    @Put('flags/:key')
    @ApiOperation({ summary: 'Feature flag güncelle/oluştur' })
    upsertFlag(
        @Param('key') key: string,
        @Body() body: { enabled: boolean; description?: string; metadata?: Record<string, any> },
    ) {
        return this.settingsService.upsertFlag(key, body.enabled, body.description, body.metadata);
    }

    @Delete('flags/:key')
    @ApiOperation({ summary: 'Feature flag sil' })
    removeFlag(@Param('key') key: string) {
        return this.settingsService.deleteFlag(key);
    }
}
