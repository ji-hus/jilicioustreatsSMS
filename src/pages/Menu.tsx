
import { useState } from 'react';
import { menuItems, categories } from '@/data/menu-items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown mb-4">Our Menu</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our selection of freshly baked artisanal breads, pastries, and treats. 
          Everything is made from scratch with high-quality ingredients.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          className={activeCategory === 'all' ? 'bg-bakery-brown hover:bg-bakery-light' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10'}
          onClick={() => setActiveCategory('all')}
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            className={activeCategory === category ? 'bg-bakery-brown hover:bg-bakery-light' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10'}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="overflow-hidden border-bakery-cream hover:shadow-md transition-shadow">
            <div className="h-48 bg-bakery-beige/50 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="font-serif text-xl text-bakery-brown">{item.name}</p>
                <p className="text-sm text-bakery-light italic">Freshly Baked</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-serif font-bold text-lg">{item.name}</h3>
                <span className="font-medium text-bakery-brown">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.dietaryInfo.vegan && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vegan</Badge>
                )}
                {item.dietaryInfo.glutenFree && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Gluten Free</Badge>
                )}
                {item.dietaryInfo.dairyFree && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Dairy Free</Badge>
                )}
                {item.dietaryInfo.nutFree && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Nut Free</Badge>
                )}
              </div>
              <Button
                asChild
                className="w-full bg-bakery-brown hover:bg-bakery-light"
              >
                <Link to={`/order?item=${item.id}`}>Pre-Order</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
