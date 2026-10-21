import { FastifyRequest, FastifyReply } from 'fastify';
import { CampaignsService } from './campaigns.service.js';
import { UpdateCampaignInput, SetCampaignProductPriceInput } from './campaigns.schema.js';
import { sendSuccess, sendNoContent } from '../../common/utils/http.js';
import { AppError } from '../../common/errors/AppError.js';

export class CampaignsController {
  constructor(private service: CampaignsService) {}

  private assertAdmin(request: FastifyRequest): void {
    if (request.user?.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
  }

  async getBlackFriday(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const campaign = await this.service.getBlackFriday();
    sendSuccess(reply, campaign);
  }

  async getAdminOverview(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.assertAdmin(request);
    const overview = await this.service.getAdminOverview();
    sendSuccess(reply, overview);
  }

  async updateCampaign(
    request: FastifyRequest<{ Body: UpdateCampaignInput }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);
    const campaign = await this.service.updateCampaign(request.body);
    sendSuccess(reply, campaign);
  }

  async setProductPrice(
    request: FastifyRequest<{ Params: { productId: string }; Body: SetCampaignProductPriceInput }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);
    const price = await this.service.setProductPrice(
      request.params.productId,
      request.body.promo_price
    );
    sendSuccess(reply, { product_id: request.params.productId, promo_price: price });
  }

  async removeProduct(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);
    await this.service.removeProduct(request.params.productId);
    sendNoContent(reply);
  }
}
