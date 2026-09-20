import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReceiptTemplateService } from '../receipts/receipt-template.service';
import { UserRole } from '../users/schemas/user.schema';
import { INVOICE_REGIONS } from './constants/invoice-regions';
import { InvoiceTemplateController } from './invoice-template.controller';
import { InvoiceTemplateService } from './invoice-template.service';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('../auth/guards/jwt-auth.guard', () => ({ JwtAuthGuard: class {} }));
jest.mock('./dto/update-invoice-template.dto', () => ({
  UpdateInvoiceTemplateDto: class {},
}));

describe('invoice template HTTP routes', () => {
  let app: INestApplication<App>;
  const teacherId = '000000000000000000000001';
  const service = {
    findOne: jest.fn(),
    getDefaultTemplate: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [InvoiceTemplateController],
      providers: [
        { provide: InvoiceTemplateService, useValue: service },
        ReceiptTemplateService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          if (req.headers.authorization !== 'Bearer test-token') {
            throw new UnauthorizedException();
          }
          req.user = {
            userId: teacherId,
            email: 'routing-test@example.invalid',
            role: UserRole.Teacher,
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => app?.close());

  it('routes regions to the registry, not the template ID handler', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/invoice-templates/regions')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    const body = response.body as { regions: { key: string }[]; css: string };
    expect(body.regions.map((region) => region.key)).toEqual(
      INVOICE_REGIONS.map((region) => region.key),
    );
    expect(body.css).toContain('.invoice-region');
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('keeps the default route separate from template IDs', async () => {
    service.getDefaultTemplate.mockResolvedValue({ id: 'SYSTEM_INVOICE_V2' });
    await request(app.getHttpServer())
      .get('/api/invoice-templates/default')
      .set('Authorization', 'Bearer test-token')
      .expect(200)
      .expect({ id: 'SYSTEM_INVOICE_V2' });
    expect(service.getDefaultTemplate).toHaveBeenCalledWith(teacherId);
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('still passes template IDs and the authenticated owner to the service', async () => {
    const id = '000000000000000000000002';
    service.findOne.mockResolvedValue({ id });
    await request(app.getHttpServer())
      .get(`/api/invoice-templates/${id}`)
      .set('Authorization', 'Bearer test-token')
      .expect(200)
      .expect({ id });
    expect(service.findOne).toHaveBeenCalledWith(teacherId, id);
  });

  it('requires authentication for the region registry', async () => {
    await request(app.getHttpServer())
      .get('/api/invoice-templates/regions')
      .expect(401);
    expect(service.findOne).not.toHaveBeenCalled();
  });
});
