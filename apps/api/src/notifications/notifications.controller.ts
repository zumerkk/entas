import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, NotificationPayload } from './notifications.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
@Roles('super_admin', 'admin')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('send')
    @ApiOperation({ summary: 'Bildirim gönder' })
    send(@Body() payload: NotificationPayload) {
        return this.notificationsService.send(payload);
    }

    @Post('send-bulk')
    @ApiOperation({ summary: 'Toplu bildirim gönder' })
    sendBulk(@Body() body: { notifications: NotificationPayload[] }) {
        return this.notificationsService.sendBulk(body.notifications);
    }

    @Get('templates')
    @ApiOperation({ summary: 'Bildirim şablonları' })
    getTemplates() {
        return this.notificationsService.getTemplates();
    }
}
