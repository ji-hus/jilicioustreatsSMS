
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  dietaryInfo: {
    vegan?: boolean;
    glutenFree?: boolean;
    nutFree?: boolean;
    dairyFree?: boolean;
  };
  available: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "sourdough-bread",
    name: "Classic Sourdough",
    category: "Breads",
    description: "Our signature sourdough bread with a crispy crust and tender, airy crumb. Made with organic flour and our house sourdough starter.",
    price: 8.50,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true
  },
  {
    id: "country-loaf",
    name: "Country Loaf",
    category: "Breads",
    description: "Rustic country-style bread with a mix of white and whole wheat flours. Perfect for sandwiches or as a side with dinner.",
    price: 7.50,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true
  },
  {
    id: "cinnamon-raisin",
    name: "Cinnamon Raisin Bread",
    category: "Breads",
    description: "Soft and slightly sweet bread packed with plump raisins and swirled with cinnamon. Delicious toasted with butter.",
    price: 9.00,
    dietaryInfo: {
      dairyFree: true,
    },
    available: true
  },
  {
    id: "focaccia",
    name: "Rosemary Focaccia",
    category: "Breads",
    description: "Italian-style focaccia brushed with olive oil and topped with fresh rosemary and sea salt.",
    price: 8.00,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true
  },
  {
    id: "chocolate-chip-cookies",
    name: "Chocolate Chip Cookies",
    category: "Pastries",
    description: "Classic chocolate chip cookies made with premium chocolate chunks and a hint of sea salt.",
    price: 2.50,
    dietaryInfo: {},
    available: true
  },
  {
    id: "blueberry-muffins",
    name: "Blueberry Muffins",
    category: "Pastries",
    description: "Tender muffins bursting with fresh blueberries and topped with a crunchy streusel.",
    price: 3.50,
    dietaryInfo: {},
    available: true
  },
  {
    id: "almond-croissant",
    name: "Almond Croissant",
    category: "Pastries",
    description: "Flaky croissant filled with rich almond cream and topped with sliced almonds.",
    price: 4.50,
    dietaryInfo: {},
    available: true
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    category: "Pastries",
    description: "Soft, swirled cinnamon rolls topped with cream cheese frosting.",
    price: 4.00,
    dietaryInfo: {},
    available: true
  },
  {
    id: "banana-bread",
    name: "Banana Bread",
    category: "Cakes",
    description: "Moist banana bread made with ripe bananas and a hint of cinnamon.",
    price: 6.00,
    dietaryInfo: {},
    available: true
  },
  {
    id: "carrot-cake",
    name: "Carrot Cake",
    category: "Cakes",
    description: "Spiced carrot cake with cream cheese frosting and chopped walnuts.",
    price: 5.50,
    dietaryInfo: {},
    available: true
  },
  {
    id: "lemon-tart",
    name: "Lemon Tart",
    category: "Cakes",
    description: "Tangy lemon curd in a buttery shortbread crust.",
    price: 5.00,
    dietaryInfo: {},
    available: true
  },
  {
    id: "vegan-choc-cake",
    name: "Vegan Chocolate Cake",
    category: "Cakes",
    description: "Rich chocolate cake made without animal products. You won't believe it's vegan!",
    price: 6.50,
    dietaryInfo: {
      vegan: true,
      dairyFree: true,
    },
    available: true
  },
];

export const categories = [...new Set(menuItems.map(item => item.category))];
