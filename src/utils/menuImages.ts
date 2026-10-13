import { MenuItemCategory } from '../types';

export const CATEGORY_IMAGE_MAP: Record<Exclude<MenuItemCategory, 'All'>, string> = {
  'Tea & Coffee': '/images/Tea & Coffee.png',
  'Snacks': '/images/Snacks.webp',
  'Sandwich': '/images/Sandwich.jpg',
  'Burger': '/images/Burger.png',
  'Garlic Bread': '/images/Garlic Bread.jpg',
  'Pizza': '/images/Pizza.png',
  'Hot Dog': '/images/Hot Dog.jpg',
  'Frankie': '/images/Frankie.avif',
  'Maggi': '/images/Maggi.avif',
  'Pasta': '/images/Pasta.jpg',
  'French Fries': '/images/French Fries.jpg',
  'Starter': '/images/Starter.avif',
  'Noodles': '/images/Noodles.webp',
  'Mocktail': '/images/Mocktail.webp',
  'Soup': '/images/Soup.webp',
  'Rice': '/images/Rice.png',
  'Shake': '/images/Shake.avif',
  'Cold Coffee': '/images/Cold Coffee.jpg',
  'Soft Drink': '/images/Soft Drink.jpg',
  'Sizzling Brownie': '/images/Sizzling Brownie.jpg',
  'Cheesecake': '/images/CheeseCake.avif',
  'Cookie Tin': '/images/Cookie Tin.jpg',
  'Coffee Tiramisu': '/images/Coffee Tiramisu.jpg',
  'Kunafa': '/images/Kunafa.webp',
  'Dessert Can': '/images/Dessert Can.png',
  'Chocolate Bowl': '/images/Chocolate Bowl.avif',
  'Baklava': '/images/Baklava.png',
  'Kunafa Cheese Bomb': '/images/Kunafa Cheese Bomb.png',
  'Bombolinis': '/images/Bombolinis.jpg',
  'Chocolate Bar': '/images/Chocolate Bar.png',
};

export const DEFAULT_MENU_IMAGE = '/images/Snacks.webp';

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

  if (normalized.includes('cheesecake')) return '/images/CheeseCake.avif';
  if (normalized.includes('cookie')) return '/images/Cookie Tin.jpg';
  if (normalized.includes('coffee')) return '/images/Cold Coffee.jpg';
  if (normalized.includes('tea')) return '/images/Tea & Coffee.png';
  if (normalized.includes('kunafa')) return '/images/Kunafa.webp';
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
