
export enum CategoryId {
  PARATHAS = 'parathas',
  THALIS = 'thalis',
  SABJI = 'sabji',
  RICE = 'rice',
  DRINKS = 'drinks',
}

export interface MenuItem {
  id: string;
  name: string;
  hindiName?: string;
  description: string;
  price: number;
  image: string;
  isSpicy?: boolean;
  isPopular?: boolean;
  isVeg: boolean;
  ingredients?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface MenuCategoryData {
  id: CategoryId;
  label: string;
  items: MenuItem[];
}
