import { supabase } from '../../db/client.js';

export const BLACK_FRIDAY_KEY = 'black_friday';

export interface Campaign {
  key: string;
  label: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignProduct {
  campaign_key: string;
  product_id: string;
  promo_price: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignScheduleInput {
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export class CampaignsRepository {
  isActive(campaign: Campaign | null, now: Date = new Date()): boolean {
    if (!campaign || !campaign.is_active) return false;

    const timestamp = now.getTime();

    if (campaign.starts_at) {
      const start = new Date(campaign.starts_at).getTime();
      if (Number.isFinite(start) && timestamp < start) return false;
    }

    if (campaign.ends_at) {
      const end = new Date(campaign.ends_at).getTime();
      if (Number.isFinite(end) && timestamp >= end) return false;
    }

    return true;
  }

  async findCampaign(key: string = BLACK_FRIDAY_KEY): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('key', key)
      .single();

    if (error) return null;
    return data;
  }

  async updateCampaign(
    key: string,
    input: CampaignScheduleInput
  ): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(input)
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findCampaignProducts(key: string = BLACK_FRIDAY_KEY): Promise<CampaignProduct[]> {
    const { data, error } = await supabase
      .from('campaign_products')
      .select('*')
      .eq('campaign_key', key);

    if (error) throw error;
    return data || [];
  }

  async upsertCampaignProduct(
    key: string,
    productId: string,
    promoPrice: number
  ): Promise<CampaignProduct> {
    const { data, error } = await supabase
      .from('campaign_products')
      .upsert(
        {
          campaign_key: key,
          product_id: productId,
          promo_price: promoPrice,
        },
        { onConflict: 'campaign_key,product_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeCampaignProduct(key: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('campaign_products')
      .delete()
      .eq('campaign_key', key)
      .eq('product_id', productId);

    if (error) throw error;
  }

  /**
   * Returns productId -> promo price for the currently running campaign.
   * Empty when the campaign is disabled or outside its schedule.
   */
  async getActivePromoMap(key: string = BLACK_FRIDAY_KEY): Promise<Map<string, number>> {
    const campaign = await this.findCampaign(key);
    if (!this.isActive(campaign)) return new Map();

    const items = await this.findCampaignProducts(key);
    return new Map(items.map((item) => [item.product_id, Number(item.promo_price)]));
  }
}
