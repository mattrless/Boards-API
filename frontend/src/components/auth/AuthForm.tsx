"use client";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthForm() {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Sign in</TabsTrigger>
        <TabsTrigger value="register">Sign up</TabsTrigger>
      </TabsList>
      <TabsContent
        value="login"
        className="origin-top data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 data-[state=active]:duration-200"
      >
        <LoginForm />
      </TabsContent>
      <TabsContent
        value="register"
        className="origin-top data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 data-[state=active]:duration-200"
      >
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
}
