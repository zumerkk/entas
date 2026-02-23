import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NotificationPayload {
    to: string;
    subject?: string;
    template: string;
    data: Record<string, unknown>;
    channel?: 'email' | 'sms' | 'push';
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private configService: ConfigService) { }

    /**
     * Bildirim gönder (fire and forget).
     * Production'da Nodemailer, Twilio, Firebase Push kullanılır.
     */
    async send(notification: NotificationPayload): Promise<void> {
        const channel = notification.channel || 'email';

        switch (channel) {
            case 'email':
                await this.sendEmail(notification);
                break;
            case 'sms':
                await this.sendSms(notification);
                break;
            case 'push':
                await this.sendPush(notification);
                break;
        }
    }

    /** Toplu bildirim */
    async sendBulk(notifications: NotificationPayload[]): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;
        for (const n of notifications) {
            try {
                await this.send(n);
                sent++;
            } catch {
                failed++;
            }
        }
        return { sent, failed };
    }

    // ─── E-posta Şablonları ───
    private async sendEmail(n: NotificationPayload) {
        // TODO: Nodemailer + SMTP entegrasyonu
        const templates: Record<string, string> = {
            'order_created': `Siparişiniz oluşturuldu: ${n.data.orderNumber}`,
            'order_shipped': `Siparişiniz kargoya verildi: ${n.data.orderNumber}`,
            'order_delivered': `Siparişiniz teslim edildi: ${n.data.orderNumber}`,
            'payment_received': `Ödemeniz alındı: ${n.data.amount} TL`,
            'account_locked': `Hesabınız kilitlendi. 15 dakika sonra tekrar deneyin.`,
            'password_changed': `Şifreniz başarıyla değiştirildi.`,
            'welcome': `Hoş geldiniz! ENTAŞ B2B platformuna kaydınız tamamlandı.`,
            'low_stock_alert': `Kritik stok uyarısı: ${n.data.productSku}`,
            'import_completed': `Import tamamlandı: ${n.data.fileName} (${n.data.successRows}/${n.data.totalRows})`,
            'quote_requested': `Teklif talebi: ${n.data.orderNumber}`,
        };

        const body = templates[n.template] || `Bildirim: ${n.template}`;

        this.logger.log(`[EMAIL] → ${n.to}: ${n.subject || n.template} — ${body}`);
        // Production'da gerçek gönderim yapılır
    }

    private async sendSms(n: NotificationPayload) {
        // TODO: Twilio / NetGSM
        this.logger.log(`[SMS] → ${n.to}: ${n.template}`);
    }

    private async sendPush(n: NotificationPayload) {
        // TODO: Firebase Cloud Messaging
        this.logger.log(`[PUSH] → ${n.to}: ${n.template}`);
    }

    /** Şablon listesi */
    getTemplates() {
        return [
            { key: 'order_created', name: 'Sipariş Oluşturuldu', channels: ['email', 'sms'] },
            { key: 'order_shipped', name: 'Sipariş Kargoda', channels: ['email', 'sms', 'push'] },
            { key: 'order_delivered', name: 'Sipariş Teslim Edildi', channels: ['email'] },
            { key: 'payment_received', name: 'Ödeme Alındı', channels: ['email'] },
            { key: 'account_locked', name: 'Hesap Kilitlendi', channels: ['email'] },
            { key: 'password_changed', name: 'Şifre Değiştirildi', channels: ['email'] },
            { key: 'welcome', name: 'Hoş Geldiniz', channels: ['email'] },
            { key: 'low_stock_alert', name: 'Stok Uyarısı', channels: ['email'] },
            { key: 'import_completed', name: 'Import Tamamlandı', channels: ['email'] },
            { key: 'quote_requested', name: 'Teklif Talebi', channels: ['email'] },
        ];
    }
}
