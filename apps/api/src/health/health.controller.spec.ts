import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should return health status', () => {
        const result = controller.health();
        expect(result.status).toBe('ok');
        expect(result.timestamp).toBeDefined();
        expect(result.uptime).toBeDefined();
    });

    it('should return readiness status', () => {
        const result = controller.ready();
        expect(result.status).toBe('ready');
        expect(result.checks).toBeDefined();
    });
});
