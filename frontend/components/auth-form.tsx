"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateUser, useLoginUser } from "@/queries";
import { toast } from "sonner";

export function AuthForm() {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    mutate: registerUser,
    isPending: isRegistering,
    error: registerError,
  } = useCreateUser();
  const {
    mutate: loginUser,
    isPending: isLoggingIn,
    error: loginError,
  } = useLoginUser();

  const handlePasswordChange = (password: string) => {
    setSignUpPassword(password);
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
        toast.error("Please enter both email and password.");
        return;
    }
    loginUser(
      { email: signInEmail, password: signInPassword },
      {
        onError: (err: any) => {
          toast.error(err.message || "Invalid credentials. Please try again.");
        },
        onSuccess: () => {
          toast.success("Welcome back!");
          // Handle successful login, e.g., redirect
        }
      }
    );
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(
      {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      },
      {
        onError: (err: any) => {
          toast.error(err.message || "Registration failed. Please try again.");
        },
        onSuccess: () => {
            toast.success("Account created successfully! Please sign in.");
            // Optionally switch to the sign-in tab
        }
      }
    );
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return "bg-red-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-green-400";
      case 4: return "bg-green-600";
      default: return "bg-gray-200";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  return (
    <Card className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl">
      <CardHeader className="text-center space-y-2 pt-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Achievo</h1>
        </div>
        <CardDescription>
            Your AI-powered journey to mastery starts here.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md rounded-md"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md rounded-md"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <Button className="w-full bg-green-600 text-white hover:bg-green-700" disabled={isLoggingIn}>
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-gray-700 font-medium">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signUpPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <div className="space-y-1 pt-1">
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full ${
                          level <= passwordStrength ? getStrengthColor() : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {signUpPassword.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Strength: {getStrengthText()}
                    </p>
                  )}
                </div>
              </div>
              <Button className="w-full bg-green-600 text-white hover:bg-green-700" disabled={isRegistering}>
                {isRegistering ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

