import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { CampaignsController } from './campaigns.controller.js';
import { CampaignsService } from './campaigns.service.js';
import { CampaignsRepository } from './campaigns.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import {
  setCampaignProductPriceSchema,
  updateCampaignSchema,
} from './campaigns.schema.js';

export async function campaignsRouter(fastify: FastifyInstance): Promise<void> {
  const repository = new CampaignsRepository();
  const productsRepository = new ProductsRepository();
  const service = new CampaignsService(repository, productsRepository);
  const controller = new CampaignsController(service);

  const getBlackFriday = controller.getBlackFriday.bind(controller) as unknown as RouteHandlerMethod;
  const getAdminOverview = controller.getAdminOverview.bind(controller) as unknown as RouteHandlerMethod;
  const updateCampaign = controller.updateCampaign.bind(controller) as unknown as RouteHandlerMethod;
  const setProductPrice = controller.setProductPrice.bind(controller) as unknown as RouteHandlerMethod;
  const removeProduct = controller.removeProduct.bind(controller) as unknown as RouteHandlerMethod;

  fastify.get('/black-friday', getBlackFriday);

  fastify.get(
    '/black-friday/admin',
    { preHandler: [authenticate] },
    getAdminOverview
  );

  fastify.patch(
    '/black-friday',
    { preHandler: [authenticate, validate(updateCampaignSchema)] },
    updateCampaign
  );

  fastify.put(
    '/black-friday/products/:productId',
    { preHandler: [authenticate, validate(setCampaignProductPriceSchema)] },
    setProductPrice
  );

  fastify.delete(
    '/black-friday/products/:productId',
    { preHandler: [authenticate] },
    removeProduct
  );
}
