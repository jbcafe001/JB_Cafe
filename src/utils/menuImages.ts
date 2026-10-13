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
