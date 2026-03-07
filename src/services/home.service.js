const HomeBannerModel = require('../models/home-banner.model');
const ProductModel = require('../models/product.model');

const DEAL_BUCKETS = [
  { min: 70, max: null, label: '70% Off' },
  { min: 60, max: 69, label: '60% Off' },
  { min: 50, max: 59, label: '50% Off' }
];

const buildDeal = (item) => {
  const base = Number(item.base_price || 0);
  const deal = item.deal_price !== null && item.deal_price !== undefined ? Number(item.deal_price) : null;
  let discount_percent = null;
  if (deal !== null && base > 0) {
    discount_percent = Math.round(((base - deal) / base) * 100);
  }
  return { ...item, discount_percent };
};

const groupDealsByDiscount = (items) => {
  const sections = DEAL_BUCKETS.map((bucket) => ({
    label: bucket.label,
    min_percent: bucket.min,
    max_percent: bucket.max,
    items: []
  }));

  for (const item of items) {
    const percent = item.discount_percent;
    if (percent === null || percent === undefined) continue;
    const bucket = sections.find((section) => {
      if (section.max_percent === null) return percent >= section.min_percent;
      return percent >= section.min_percent && percent <= section.max_percent;
    });
    if (bucket) bucket.items.push(item);
  }

  return sections.filter((section) => section.items.length > 0);
};

const getHomeData = async () => {
  const [banners, newArrivals, deals, popular] = await Promise.all([
    HomeBannerModel.listActive(),
    ProductModel.listSection({ section: 'new', limit: 6 }),
    ProductModel.listSection({ section: 'deal', limit: 50 }),
    ProductModel.listSection({ section: 'popular', limit: 6 })
  ]);

  const dealItems = deals.map(buildDeal);
  const dealSections = groupDealsByDiscount(dealItems);

  return {
    banners,
    new_arrivals: newArrivals,
    deals: dealItems,
    deal_sections: dealSections,
    popular
  };
};

module.exports = { getHomeData };
