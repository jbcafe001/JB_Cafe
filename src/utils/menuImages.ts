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

/**
 * Returns the image path for a given category name (case-insensitive fallback included).
 */
export const getCategoryImageUrl = (category: string | undefined | null): string => {
  if (!category) return '/logo.png';
  if (CATEGORY_IMAGE_MAP[category as Exclude<MenuItemCategory, 'All'>]) {
    return CATEGORY_IMAGE_MAP[category as Exclude<MenuItemCategory, 'All'>];
  }
  const normalized = category.trim().toLowerCase();
  for (const [cat, path] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (cat.toLowerCase() === normalized) {
      return path;
    }
  }
  return '/logo.png';
};

/**
 * Returns the image path for a menu item.
 * Falls back to the item's category image if item.image is not explicitly defined.
 */
export const getMenuItemImageUrl = (item: { image?: string; category?: string } | null | undefined): string => {
  if (!item) return '/logo.png';
  if (item.image && item.image.trim()) {
    return item.image;
  }
  if (item.category) {
    return getCategoryImageUrl(item.category);
  }
  return '/logo.png';
};
