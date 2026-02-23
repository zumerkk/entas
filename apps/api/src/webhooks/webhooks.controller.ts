import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService, WebhookConfig } from './webhooks.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
@ApiBearerAuth()
@Roles('super_admin', 'admin')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post('register')
    @ApiOperation({ summary: 'Webhook endpoint kaydet' })
    register(@Body() config: WebhookConfig) {
        this.webhooksService.registerWebhook(config);
        return { registered: true, url: config.url };
    }

    @Post('dispatch')
    @ApiOperation({ summary: 'Manuel event dispatch (test)' })
    dispatch(@Body() body: { eventType: string; payload: any }) {
        return this.webhooksService.dispatch(body.eventType, body.payload);
    }

    @Post('retry')
    @ApiOperation({ summary: 'Başarısız event tekrar gönder' })
    retry() {
        return this.webhooksService.retryFailed();
    }

    @Get('events')
    @ApiOperation({ summary: 'Webhook event listesi' })
    findAll(
        @Query('page') page?: string, @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.webhooksService.findAll(page ? +page : 1, limit ? +limit : 20, status);
    }
}
