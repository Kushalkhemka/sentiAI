
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Credentials, User, UserProfile } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface AuthFormProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    password: "", 
    name: "", 
    confirmPassword: "" 
  });
  const { toast } = useToast();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, you'd validate with a backend
    // For demo purposes, we'll check local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === loginData.email);
    
    setTimeout(() => {
      if (user && user.password === loginData.password) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name || user.email}!`,
        });
        
        onLogin({
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password.",
        });
      }
      setIsLoading(false);
    }, 1500); // Artificial delay for demo
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
      });
      setIsLoading(false);
      return;
    }
    
    // In a real app, you'd create a user in your backend
    // For demo purposes, we'll use local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === signupData.email);
    
    if (existingUser) {
      toast({
        variant: "destructive",
        title: "Email already in use",
        description: "Please use a different email address.",
      });
      setIsLoading(false);
      return;
    }
    
    const newUser = {
      id: uuidv4(),
      email: signupData.email,
      password: signupData.password,
      name: signupData.name,
      profile: {
        name: signupData.name,
        createdAt: new Date(),
        updatedAt: new Date()
      } as UserProfile
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    setTimeout(() => {
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      
      onSignup({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profile: newUser.profile
      });
      setIsLoading(false);
    }, 1500); // Artificial delay for demo
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4"
      >
        <Card className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <motion.div
                initial={{ x: activeTab === 'login' ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Login to access your personalized chat experience
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="hello@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Forgot password?
                        </Button>
                      </div>
                      <Input 
                        id="password"
                        type="password" 
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Log In"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="signup">
              <motion.div
                initial={{ x: activeTab === 'signup' ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Sign up to personalize your chat experience and save your history
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name"
                        placeholder="John Doe" 
                        value={signupData.name}
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email"
                        type="email" 
                        placeholder="hello@example.com" 
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password"
                        type="password" 
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password"
                        type="password" 
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            </TabsContent>
            
            <CardFooter className="flex flex-col space-y-2 pt-4">
              <div className="text-sm text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
              
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Empathetic AI Chat
                  </span>
                </div>
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthForm;
