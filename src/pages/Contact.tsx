import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, Mail, MessageCircle, Home, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactPage = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string, sender: 'user' | 'bakery'}[]>([
    { text: "Hello! How can I help you today?", sender: 'bakery' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Contact form submitted:", data);
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. We'll get back to you soon!",
    });
    form.reset();
  };

  const sendChatMessage = () => {
    if (!userMessage.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    
    // Simulate bakery response after a short delay
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { 
          text: "Thanks for your message! This is a simulated response. In a real implementation, you'd connect this to a chat service.", 
          sender: 'bakery' 
        }
      ]);
    }, 1000);
    
    setUserMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-brown text-center mb-4">
        Contact Us
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Have questions about our products or want to place a special order? We'd love to hear from you!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Send Us a Message</CardTitle>
              <CardDescription>Fill out the form and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <Input 
                      id="name"
                      {...form.register('name')}
                      placeholder="Your name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <Input 
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="Your email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <Textarea 
                      id="message"
                      {...form.register('message')}
                      placeholder="Your message"
                      className="h-32 resize-none"
                    />
                    {form.formState.errors.message && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-bakery-brown hover:bg-bakery-light text-white"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Contact Information</CardTitle>
              <CardDescription>Ways to reach us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start">
                <Home className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Address</h3>
                  <p className="text-gray-600">123 Baking Street</p>
                  <p className="text-gray-600">Flourville, BK 98765</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-gray-600">hello@jilicioustreats.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Instagram className="h-5 w-5 mr-4 text-bakery-gold mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Instagram</h3>
                  <a 
                    href="https://instagram.com/jilicioustreats" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-bakery-brown hover:text-bakery-gold transition-colors"
                  >
                    @jilicioustreats
                  </a>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setIsChatActive(!isChatActive)}
                  className="w-full flex items-center justify-center gap-2 bg-bakery-brown hover:bg-bakery-light text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isChatActive ? "Close Chat" : "Start Live Chat"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isChatActive && (
            <Card>
              <CardHeader className="bg-bakery-brown text-white rounded-t-lg">
                <CardTitle className="font-serif text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] rounded-lg p-3 ${
                          msg.sender === 'user' 
                            ? 'bg-bakery-brown text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="flex w-full">
                  <Input
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow mr-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendChatMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendChatMessage}
                    className="bg-bakery-brown hover:bg-bakery-light text-white"
                  >
                    Send
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-12">
        <Card className="border-none shadow-md">
          <CardContent className="p-0">
            <div className="h-64 flex items-center justify-center bg-bakery-cream/30">
              <div className="text-center p-6">
                <h3 className="font-serif text-xl text-bakery-brown mb-2">Our Location</h3>
                <p className="text-gray-600">This would be a map in a real implementation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
