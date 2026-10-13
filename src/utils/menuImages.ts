import { MenuItemCategory } from '../types';

export const CATEGORY_IMAGE_MAP: Record<Exclude<MenuItemCategory, 'All'>, string> = {
  'Tea & Coffee': '/images/Tea & Coffee.png',
  'Snacks': '/images/Snacks.png',
  'Sandwich': '/images/Sandwich.png',
  'Burger': '/images/Burger.png',
  'Garlic Bread': '/images/Garlic Bread.png',
  'Pizza': '/images/Pizza.png',
  'Hot Dog': '/images/Hot Dog.png',
  'Frankie': '/images/Frankie.png',
  'Maggi': '/images/Maggi.png',
  'Pasta': '/images/Pasta.png',
  'French Fries': '/images/French Fries.png',
  'Starter': '/images/Starter.png',
  'Noodles': '/images/Noodles.webp',
  'Mocktail': '/images/Mocktail.png',
  'Soup': '/images/Soup.webp',
  'Rice': '/images/Rice.png',
  'Shake': '/images/Shake.png',
  'Cold Coffee': '/images/Cold Coffee.jpg',
  'Soft Drink': '/images/Soft Drink.png',
  'Sizzling Brownie': '/images/Sizzling Brownie.jpg',
  'Cheesecake': '/images/CheeseCake.png',
  'Cookie Tin': '/images/Cookie Tin.png',
  'Coffee Tiramisu': '/images/Coffee Tiramisu.png',
  'Kunafa': '/images/Kunafa.png',
  'Dessert Can': '/images/Dessert Can.png',
  'Chocolate Bowl': '/images/Chocolate Bowl.png',
  'Baklava': '/images/Baklava.png',
  'Kunafa Cheese Bomb': '/images/Kunafa Cheese Bomb.png',
  'Bombolinis': '/images/Bombolinis.png',
  'Chocolate Bar': '/images/Chocolate Bar.png',
};

export const DEFAULT_MENU_IMAGE = '/images/Snacks.png';

/**
 * Returns the image URL for a given category name.
 * Handles exact matches, case-insensitive matches, and aliases.
 */
export function getCategoryImageUrl(category?: string | null): string {
  if (!category) return DEFAULT_MENU_IMAGE;

  if (category in CATEGORY_IMAGE_MAP) {
    return CATEGORY_IMAGE_MAP[category as Exclude<MenuItemCategory, 'All'>];
  }

  const normalized = category.trim().toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (key.toLowerCase() === normalized) {
      return url;
    }
  }

  if (normalized.includes('cheesecake')) return '/images/CheeseCake.png';
  if (normalized.includes('cookie')) return '/images/Cookie Tin.png';
  if (normalized.includes('coffee')) return '/images/Cold Coffee.jpg';
  if (normalized.includes('tea')) return '/images/Tea & Coffee.png';
  if (normalized.includes('kunafa')) return '/images/Kunafa.png';
  if (normalized.includes('brownie')) return '/images/Sizzling Brownie.jpg';

  return DEFAULT_MENU_IMAGE;
}

/**
 * Returns the image URL to display for any menu item.
 * Prioritizes item.image if valid, otherwise falls back to category image.
 */
export function getMenuItemImage(item?: { image?: string; category?: string } | null): string {
  if (!item) return DEFAULT_MENU_IMAGE;
  if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
    return item.image;
  }
  return getCategoryImageUrl(item.category);
}

/**
 * Returns the image URL to display for an order item.
 * Searches menuItems by id or name, uses item.image if available,
 * or falls back to category image via name or category string.
 */
export function getOrderItemImage(
  item?: { menuItemId?: string; name?: string; image?: string; category?: string } | null,
  menuItems?: Array<{ id: string; name: string; image?: string; category?: any }>
): string {
  if (!item) return DEFAULT_MENU_IMAGE;
  if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
    return item.image;
  }
  if (menuItems && menuItems.length > 0) {
    const found = menuItems.find(
      (m) =>
        (item.menuItemId && m.id === item.menuItemId) ||
        (item.name && m.name.toLowerCase() === item.name.toLowerCase())
    );
    if (found) {
      return getMenuItemImage(found);
    }
  }
  if (item.category) {
    return getCategoryImageUrl(item.category);
  }
  // Try matching item name against known categories
  if (item.name) {
    const nameLower = item.name.toLowerCase();
    for (const cat of Object.keys(CATEGORY_IMAGE_MAP) as Array<Exclude<MenuItemCategory, 'All'>>) {
      if (nameLower.includes(cat.toLowerCase())) {
        return CATEGORY_IMAGE_MAP[cat];
      }
    }
    // Specific aliases for common dishes
    if (nameLower.includes('burger')) return '/images/Burger.png';
    if (nameLower.includes('kunafa')) return '/images/Kunafa.png';
    if (nameLower.includes('fries') || nameLower.includes('fry')) return '/images/French Fries.png';
    if (nameLower.includes('pizza')) return '/images/Pizza.png';
    if (nameLower.includes('sandwich')) return '/images/Sandwich.png';
    if (nameLower.includes('pasta')) return '/images/Pasta.png';
    if (nameLower.includes('maggi') || nameLower.includes('noodles')) return '/images/Maggi.png';
    if (nameLower.includes('coffee')) return '/images/Cold Coffee.jpg';
    if (nameLower.includes('tea') || nameLower.includes('chai')) return '/images/Tea & Coffee.png';
    if (nameLower.includes('shake')) return '/images/Shake.png';
    if (nameLower.includes('mocktail')) return '/images/Mocktail.png';
    if (nameLower.includes('cheesecake')) return '/images/CheeseCake.png';
    if (nameLower.includes('brownie')) return '/images/Sizzling Brownie.jpg';
    if (nameLower.includes('baklava')) return '/images/Baklava.png';
    if (nameLower.includes('garlic bread')) return '/images/Garlic Bread.png';
    if (nameLower.includes('frankie') || nameLower.includes('roll')) return '/images/Frankie.png';
    if (nameLower.includes('hot dog')) return '/images/Hot Dog.png';
    if (nameLower.includes('soup')) return '/images/Soup.webp';
    if (nameLower.includes('rice')) return '/images/Rice.png';
    if (nameLower.includes('starter')) return '/images/Starter.png';
  }
  return DEFAULT_MENU_IMAGE;
}
