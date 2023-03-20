export interface User 
{
  uid: string;
  email: string;
  firstname: string;
  name: string;
  role: "admin" | "user";
  password: string;
}