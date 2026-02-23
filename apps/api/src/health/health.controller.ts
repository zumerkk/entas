import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'API is healthy' })
    health() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness check' })
    @ApiResponse({ status: 200, description: 'API is ready to accept traffic' })
    ready() {
        // TODO: check MongoDB + Redis connectivity
        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
            checks: {
                mongodb: 'pending', // will be implemented in Phase 2
                redis: 'pending',
            },
        };
    }
}
