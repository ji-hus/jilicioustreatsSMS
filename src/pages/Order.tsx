import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuItems, categories } from '@/data/menu-items';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Calendar as CalendarIcon, X, Plus, Minus, Vegan, EggOff, MilkOff } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import emailjs from '@emailjs/browser';
import { orderEmailTemplate } from '@/email-templates';
import { useCart } from '@/contexts/CartContext';
import { sendSMS } from '@/config/twilio';

// Initialize EmailJS
emailjs.init("jRgg2OkLA0U1pS4WQ");

// Define form schema
const orderFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  inStockPickupDate: z.date({
    required_error: "Please select a pickup date for in-stock items",
  }),
  inStockPickupTime: z.string({
    required_error: "Please select a pickup time for in-stock items",
  }),
  madeToOrderPickupDate: z.date({
    required_error: "Please select a pickup date for made-to-order items",
  }),
  madeToOrderPickupTime: z.string({
    required_error: "Please select a pickup time for made-to-order items",
  }),
  specialInstructions: z.string().optional(),
  reminderPreference: z.enum(['email', 'sms', 'both', 'none']),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

// Initial values for the form
const defaultValues: Partial<OrderFormValues> = {
  name: '',
  email: '',
  phone: '',
  inStockPickupDate: undefined,
  inStockPickupTime: undefined,
  madeToOrderPickupDate: undefined,
  madeToOrderPickupTime: undefined,
  specialInstructions: '',
  reminderPreference: 'email',
};

// Type for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Dietary restrictions for filtering
const dietaryOptions = [
  { id: "vegan", label: "Vegan", icon: <Vegan className="mr-1.5" /> },
  { id: "glutenFree", label: "Gluten Free", icon: <EggOff className="mr-1.5" /> },
  { id: "dairyFree", label: "Dairy Free", icon: <MilkOff className="mr-1.5" /> },
  { id: "nutFree", label: "Nut Free", icon: null }
];

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Split cart items into in-stock and made-to-order
  const inStockItems = cart.filter(item => {
    const menuItem = menuItems.find(mi => mi.id === item.id);
    return menuItem && !menuItem.madeToOrder;
  });

  const madeToOrderItems = cart.filter(item => {
    const menuItem = menuItems.find(mi => mi.id === item.id);
    return menuItem && menuItem.madeToOrder;
  });

  // Create validation schema with access to cart items
  const createValidationSchema = () => {
    return orderFormSchema.refine((data) => {
      // First check if cart is empty
      if (cart.length === 0) {
        return false;
      }

      // If there are in-stock items, require in-stock pickup details
      if (inStockItems.length > 0) {
        if (!data.inStockPickupDate || !data.inStockPickupTime) {
          return false;
        }
      }
      // If there are made-to-order items, require made-to-order pickup details
      if (madeToOrderItems.length > 0) {
        if (!data.madeToOrderPickupDate || !data.madeToOrderPickupTime) {
          return false;
        }
      }
      return true;
    }, {
      message: cart.length === 0 
        ? "Please add items to your cart before submitting your order" 
        : "Please select pickup date and time for all items",
      path: ["inStockPickupDate", "madeToOrderPickupDate"]
    });
  };

  // Create form with dynamic validation
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(createValidationSchema()),
    defaultValues,
    mode: "onChange"
  });

  // Get the item ID from URL search params and add to cart if it exists
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId) {
      const menuItem = menuItems.find(item => item.id === itemId);
      if (menuItem && !cart.some(item => item.id === itemId)) {
        setCart(prevCart => [...prevCart, {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }]);
      }
    }
  }, [searchParams, cart]);

  // Filter menu items based on selected category and dietary restrictions
  const filteredMenuItems = menuItems.filter(item => {
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Filter by dietary restrictions if any are selected
    const matchesDietary = selectedDietary.length === 0 || selectedDietary.every(restriction => 
      item.dietaryInfo[restriction as keyof typeof item.dietaryInfo]
    );
    
    return matchesCategory && matchesDietary;
  });

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Determine if order contains made-to-order items
  const hasMadeToOrderItems = madeToOrderItems.length > 0;

  // Get available pickup dates based on order type
  const getAvailablePickupDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If order contains made-to-order items
    if (hasMadeToOrderItems) {
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilWednesday = (3 - currentDay + 7) % 7; // Days until next Wednesday
      const orderDeadline = new Date(today);
      orderDeadline.setDate(today.getDate() + daysUntilWednesday);
      orderDeadline.setHours(18, 0, 0, 0); // 6 PM

      // If current time is past Wednesday 6 PM, move to next week
      if (today > orderDeadline) {
        orderDeadline.setDate(orderDeadline.getDate() + 7);
      }

      // Available pickup dates are Thursday through Saturday
      const isThursday = date.getDay() === 4;
      const isFriday = date.getDay() === 5;
      const isSaturday = date.getDay() === 6;
      
      // Must be at least 24 hours after order
      const minPickupDate = new Date(today);
      minPickupDate.setDate(today.getDate() + 1);
      
      return (isThursday || isFriday || isSaturday) && date >= minPickupDate;
    } else {
      // For in-stock items only
      const isWeekday = date.getDay() >= 1 && date.getDay() <= 5; // Monday through Friday
      const minPickupDate = new Date(today);
      minPickupDate.setDate(today.getDate() + 1); // At least 24 hours after order
      
      return isWeekday && date >= minPickupDate;
    }
  };

  // Get available pickup times based on order type
  const getAvailablePickupTimes = () => {
    if (hasMadeToOrderItems) {
      // For made-to-order items, available all day
      return [
        "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
        "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
        "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
        "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
        "5:00 PM", "5:30 PM", "6:00 PM"
      ];
    } else {
      // For in-stock items, noon to 6 PM
      return [
        "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
        "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
        "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
        "6:00 PM"
      ];
    }
  };

  // Handle adding item to cart
  const addToCart = (item: typeof menuItems[0]) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    // Check if item is made to order or has stock available
    if (!item.madeToOrder && item.stock <= 0) {
      toast({
        title: "Out of stock",
        description: `${item.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }

    // Check if adding one more would exceed stock
    if (!item.madeToOrder && existingItem && existingItem.quantity >= item.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.stock} ${item.name} available.`,
        variant: "destructive"
      });
      return;
    }
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }

    toast({
      title: "Item added to cart",
      description: `${item.name} has been added to your order.`,
    });
  };

  // Handle removing item from cart
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem?.madeToOrder && quantity > menuItem!.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${menuItem!.stock} ${menuItem!.name} available.`,
        variant: "destructive"
      });
      return;
    }

    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Handle dietary filter toggle
  const handleDietaryToggle = (value: string[]) => {
    setSelectedDietary(value);
  };

  const sendReminder = async (data: OrderFormValues) => {
    const reminderTime = new Date(`${data.inStockPickupDate}T${data.inStockPickupTime}`);
    const reminderDate = new Date(reminderTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before pickup

    // Prepare reminder message
    const reminderMessage = `Reminder: Your order from Jilicious Treats is ready for pickup tomorrow at ${data.inStockPickupTime}. 
    Location: 3118 Hickory Lawn Rd., Rochester Hills, MI 48307. 
    Please bring your order confirmation.`;

    try {
      // Send email reminder if selected
      if (data.reminderPreference === 'email' || data.reminderPreference === 'both') {
        await emailjs.send(
          'service_10tkiq3',
          'template_zm1pn05',
          {
            to_email: data.email,
            from_name: 'Jilicious Treats',
            message: reminderMessage,
            subject: 'Order Pickup Reminder',
          },
          'jRgg2OkLA0U1pS4WQ'
        );
      }

      // Send SMS reminder if selected
      if (data.reminderPreference === 'sms' || data.reminderPreference === 'both') {
        await sendSMS(data.phone, reminderMessage);
      }

      console.log('Reminder scheduled for:', reminderDate);
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare email template parameters
      const templateParams = {
        to_email: data.email,
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        pickup_date: data.inStockPickupDate ? format(data.inStockPickupDate, 'MMMM d, yyyy') : 'N/A',
        pickup_time: data.inStockPickupTime || 'N/A',
        special_instructions: data.specialInstructions || 'None',
        order_items: cart.map(item => 
          `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n'),
        total_amount: `$${cartTotal.toFixed(2)}`,
        message: `Order placed by ${data.name} for pickup on ${data.inStockPickupDate ? format(data.inStockPickupDate, 'MMMM d, yyyy') : 'N/A'} at ${data.inStockPickupTime || 'N/A'}`,
        reply_to: data.email
      };

      console.log('Sending order email with parameters:', templateParams);

      // Send order confirmation email
      const result = await emailjs.send(
        'service_10tkiq3',
        'template_34tuje7',
        templateParams,
        'jRgg2OkLA0U1pS4WQ'
      );

      console.log('Order email sent successfully:', result);

      // Schedule reminder
      await sendReminder(data);

      toast({
        title: "Order placed successfully!",
        description: "We've sent you a confirmation email and will remind you about your pickup.",
      });
      
      clearCart();
      form.reset(defaultValues);
    } catch (error) {
      console.error('Error placing order:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      toast({
        title: "Error",
        description: "There was a problem placing your order. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Place Your Pre-Order
      </h1>
      <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12 font-sans">
        Order your freshly baked goods ahead of time for pickup at our location.
      </p>

      {/* Order Deadline Notice */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-bakery-gold/10 border border-bakery-gold/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-serif font-semibold text-bakery-brown mb-2">
            Important Order Information
          </h2>
          <p className="text-lg text-gray-700 font-sans">
            Orders close Wednesday by 6pm for Saturday pickup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Select Items</CardTitle>
              <CardDescription className="text-lg font-sans">Browse our menu and add items to your order</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category filter */}
              <div className="mb-6">
                <h3 className="font-serif font-medium text-base mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className={selectedCategory === 'all' ? 'bg-bakery-brown hover:bg-bakery-light font-sans text-lg' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10 font-sans text-lg'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className={selectedCategory === category ? 'bg-bakery-brown hover:bg-bakery-light font-sans text-lg' : 'border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10 font-sans text-lg'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dietary restrictions filter */}
              <div className="mb-6">
                <h3 className="font-serif font-medium text-base mb-2">Dietary Preferences</h3>
                <ToggleGroup 
                  type="multiple" 
                  variant="outline" 
                  className="flex flex-wrap gap-2"
                  value={selectedDietary} 
                  onValueChange={handleDietaryToggle}
                >
                  {dietaryOptions.map(option => (
                    <ToggleGroupItem 
                      key={option.id} 
                      value={option.id} 
                      aria-label={option.label}
                      className="flex items-center border-bakery-brown text-bakery-brown hover:bg-bakery-brown/10 data-[state=on]:bg-bakery-brown data-[state=on]:text-white font-sans text-lg"
                    >
                      {option.icon}
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Menu items */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 font-sans text-lg">
                    No items match your selected filters.
                  </div>
                ) : (
                  categories
                    .filter(category => 
                      selectedCategory === 'all' || category === selectedCategory
                    )
                    .map(category => {
                      const categoryItems = filteredMenuItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-8">
                          <h3 className="font-serif font-semibold text-lg mb-3">{category}</h3>
                          <div className="space-y-3">
                            {categoryItems.map(item => (
                              <div key={item.id} className="flex justify-between items-center p-3 rounded-md bg-bakery-cream/20 hover:bg-bakery-cream/40">
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium font-sans text-lg">{item.name}</p>
                                    <div className="flex ml-2 gap-1">
                                      {item.dietaryInfo.vegan && (
                                        <span title="Vegan"><Vegan size={16} className="text-green-600" /></span>
                                      )}
                                      {item.dietaryInfo.glutenFree && (
                                        <span title="Gluten Free"><EggOff size={16} className="text-yellow-600" /></span>
                                      )}
                                      {item.dietaryInfo.dairyFree && (
                                        <span title="Dairy Free"><MilkOff size={16} className="text-blue-600" /></span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)}</p>
                                    {item.madeToOrder ? (
                                      <Badge variant="outline" className="text-bakery-brown border-bakery-brown font-sans text-base">Made to Order</Badge>
                                    ) : item.stock > 0 ? (
                                      <Badge variant="outline" className="text-green-600 border-green-600 font-sans text-base">{item.stock} in stock</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-red-600 border-red-600 font-sans text-base">Out of stock</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => addToCart(item)}
                                  variant="outline" 
                                  size="sm"
                                  className="border-bakery-brown text-bakery-brown hover:bg-bakery-brown hover:text-white font-sans text-lg"
                                  disabled={!item.madeToOrder && item.stock === 0}
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              
              {/* Legend for dietary icons */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-base font-medium mb-2 font-sans">Dietary Information:</h4>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center font-sans">
                    <Vegan size={14} className="text-green-600 mr-1.5" /> Vegan
                  </div>
                  <div className="flex items-center font-sans">
                    <EggOff size={14} className="text-yellow-600 mr-1.5" /> Gluten Free
                  </div>
                  <div className="flex items-center font-sans">
                    <MilkOff size={14} className="text-blue-600 mr-1.5" /> Dairy Free
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Form and Cart */}
        <div className="lg:col-span-2">
          <div className="grid gap-8">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Your Order</CardTitle>
                <CardDescription className="text-lg font-sans">Review your selected items</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 font-sans text-lg">
                    Your cart is empty. Add items from the menu to get started.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inStockItems.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 text-bakery-brown">In-Stock Items</h3>
                        <div className="space-y-4">
                          {inStockItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-4 rounded-md bg-white border">
                              <div>
                                <p className="font-medium font-sans text-lg">{item.name}</p>
                                <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-sans text-lg">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {madeToOrderItems.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 text-bakery-brown">Made-to-Order Items</h3>
                        <div className="space-y-4">
                          {madeToOrderItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-4 rounded-md bg-white border">
                              <div>
                                <p className="font-medium font-sans text-lg">{item.name}</p>
                                <p className="text-base text-gray-600 font-sans">${item.price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-sans text-lg">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between font-bold text-xl">
                        <span className="font-sans">Total:</span>
                        <span className="font-sans">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Customer Information</CardTitle>
                <CardDescription>
                  {hasMadeToOrderItems ? (
                    <div className="text-amber-600 font-sans text-lg">
                      <p>Made-to-order items can only be picked up on Saturdays between 9 AM and 5 PM.</p>
                      <p>Please allow at least 24 hours between order and pickup.</p>
                    </div>
                  ) : (
                    <div className="font-sans text-lg">
                      <p>In-stock items can be picked up Monday-Friday, 9 AM - 5 PM.</p>
                      <p>Please allow at least 24 hours between order and pickup.</p>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit(onSubmit)} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans text-lg">Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} className="font-sans text-lg" />
                            </FormControl>
                            <FormMessage className="font-sans text-base" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans text-lg">Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} className="font-sans text-lg" />
                            </FormControl>
                            <FormMessage className="font-sans text-base" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-lg">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} className="font-sans text-lg" />
                          </FormControl>
                          <FormMessage className="font-sans text-base" />
                        </FormItem>
                      )}
                    />

                    {inStockItems.length > 0 && (
                      <div className="space-y-6 border-t pt-6">
                        <h3 className="font-medium text-lg text-bakery-brown">In-Stock Items Pickup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="inStockPickupDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-sans text-lg">Pickup Date <span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal font-sans text-lg",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Select date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => {
                                        const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;
                                        const minPickupDate = new Date();
                                        minPickupDate.setDate(minPickupDate.getDate() + 1);
                                        return !isWeekday || date < minPickupDate;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="inStockPickupTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-lg">Pickup Time <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="font-sans text-lg">
                                      <SelectValue placeholder="Select a pickup time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[
                                      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
                                      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                                      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
                                      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
                                      "5:00 PM"
                                    ].map((time) => (
                                      <SelectItem key={time} value={time} className="font-sans text-lg">
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {madeToOrderItems.length > 0 && (
                      <div className="space-y-6 border-t pt-6">
                        <h3 className="font-medium text-lg text-bakery-brown">Made-to-Order Items Pickup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="madeToOrderPickupDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-sans text-lg">Pickup Date <span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal font-sans text-lg",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Select date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => {
                                        const isSaturday = date.getDay() === 6;
                                        const minPickupDate = new Date();
                                        minPickupDate.setDate(minPickupDate.getDate() + 1);
                                        return !isSaturday || date < minPickupDate;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="madeToOrderPickupTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-lg">Pickup Time <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="font-sans text-lg">
                                      <SelectValue placeholder="Select a pickup time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[
                                      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
                                      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                                      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
                                      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
                                      "5:00 PM"
                                    ].map((time) => (
                                      <SelectItem key={time} value={time} className="font-sans text-lg">
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="font-sans text-base" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-lg">Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or dietary concerns?" 
                              className="resize-none font-sans text-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-sans text-base" />
                        </FormItem>
                      )}
                    />

                    <div>
                      <label htmlFor="reminderPreference" className="block text-sm font-medium mb-1">
                        Pickup Reminder Preference
                      </label>
                      <select
                        id="reminderPreference"
                        {...form.register('reminderPreference')}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="email">Email Reminder</option>
                        <option value="sms">SMS Reminder</option>
                        <option value="both">Both Email and SMS</option>
                        <option value="none">No Reminder</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        We'll send you a reminder 24 hours before your pickup time
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-bakery-brown hover:bg-bakery-light text-white font-sans text-lg"
                      disabled={cart.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? "Placing order..." : (cart.length === 0 ? "Add items to cart to place order" : "Place Order")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
