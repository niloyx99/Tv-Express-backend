export const DEFAULT_HOME_CONTENT = {
  key: 'main',
  heroMain: {
    badge: 'Smart Home Living & Appliances',
    titleLine1: 'Best Cooling',
    titleAccent: 'TVs',
    description:
      'Upgrade your luxury living with dual-inverter smart refrigerators, cinematic 4K Quantum LED display sets, and fast-deodorizing kitchen modules.',
    buttonText: 'Shop Refrigerators',
    image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600',
    category: 'furniture',
  },
  sliderSlides: [
    {
      image: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=800',
      alt: 'Premium AC Deal',
      category: 'electronics',
    },
    {
      image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800',
      alt: 'Smart Cooling Unit',
      category: 'electronics',
    },
    {
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800',
      alt: 'Inverter AC Split',
      category: 'electronics',
    },
  ],
  promoCards: [
    {
      id: 'promo-washers',
      badge: 'Inverter Washers',
      title: 'Smart Loading Laundry Washers',
      titleHighlight: '',
      buttonText: 'Check Washers',
      image: 'https://images.unsplash.com/photo-1626806780454-86f2b5ce779e?auto=format&fit=crop&q=80&w=300',
      category: 'fashion',
      tone: 'emerald',
    },
    {
      id: 'promo-ovens',
      badge: 'Kitchen Gear',
      title: 'Kitchen Ovens Up to',
      titleHighlight: '30% Off',
      buttonText: 'Explore Ovens',
      image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=300',
      category: 'appliances',
      tone: 'amber',
    },
    {
      id: 'promo-tvs',
      badge: 'Cinema Screens',
      title: 'Quantum 4K UHD Smart TV Sets',
      titleHighlight: '',
      buttonText: 'View UHD TVs',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=300',
      category: 'smartwatches',
      tone: 'cyan',
    },
  ],
  weeklyDealsSettings: {
    eyebrow: 'Exclusive limited time offers',
    title: 'Weekly Best Deals',
    offerEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
  },
  categoryStripSettings: {
    eyebrow: 'Quick Discovery',
    title: 'Shop Deals by Category',
    subtitle:
      'Premium home refrigerators, smart 4K TVs, super quiet inverter air conds, and modern kitchen gadgets with dual warranties.',
  },
};
