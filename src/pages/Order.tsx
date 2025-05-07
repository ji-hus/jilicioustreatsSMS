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
import { Calendar as CalendarIcon, X, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Define form schema
const orderFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  pickupDate: z.date({
    required_error: "Please select a pickup date",
  }),
  pickupTime: z.string({
    required_error: "Please select a pickup time",
  }),
  specialInstructions: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

// Initial values for the form
const defaultValues: Partial<OrderFormValues> = {
  name: '',
  email: '',
  phone: '',
  specialInstructions: '',
};

// Type for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
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

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle adding item to cart
  const addToCart = (item: typeof menuItems[0]) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
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

    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Handle form submission
  const onSubmit = (data: OrderFormValues) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before submitting your order.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the order to your backend
    console.log("Order submitted:", {
      customer: data,
      items: cart,
      total: cartTotal
    });

    toast({
      title: "Order received!",
      description: `Thank you for your order. We'll see you on ${format(data.pickupDate, 'MMMM d, yyyy')} at ${data.pickupTime}.`,
    });

    // Reset form and cart
    form.reset(defaultValues);
    setCart([]);
  };

  const pickupTimes = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Place Your Pre-Order
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Order your freshly baked goods ahead of time for pickup at our location.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Select Items</CardTitle>
              <CardDescription>Browse our menu and add items to your order</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {categories.map(category => (
                <div key={category} className="mb-8">
                  <h3 className="font-serif font-semibold text-lg mb-3">{category}</h3>
                  <div className="space-y-3">
                    {menuItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 rounded-md bg-bakery-cream/20 hover:bg-bakery-cream/40">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                          </div>
                          <Button 
                            onClick={() => addToCart(item)}
                            variant="outline" 
                            size="sm"
                            className="border-bakery-brown text-bakery-brown hover:bg-bakery-brown hover:text-white"
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
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
                <CardDescription>Review your selected items</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Your cart is empty. Add items from the menu to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-4 rounded-md bg-white border">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
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
                          <span className="w-8 text-center">{item.quantity}</span>
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

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${cartTotal.toFixed(2)}</span>
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
                <CardDescription>Enter your details and select pickup time</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pickupDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Pickup Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
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
                                    // Disable dates in the past and only allow next 14 days
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const twoWeeksLater = new Date();
                                    twoWeeksLater.setDate(today.getDate() + 14);
                                    return date < today || date > twoWeeksLater;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pickupTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pickup Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a pickup time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {pickupTimes.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or dietary concerns?" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-bakery-brown hover:bg-bakery-light text-white"
                    >
                      Place Order
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 text-sm text-gray-500">
                <p>* Orders must be placed at least 24 hours in advance.</p>
                <p>* Payment will be collected at pickup.</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
