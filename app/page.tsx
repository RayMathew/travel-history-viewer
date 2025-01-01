"use client"

import AuthProvider from "./providers/AuthProvider/authprovider";
import { UserProvider } from "./providers/UserProvider/userprovider";
import { PrimeReactProvider } from "primereact/api";
import Tailwind from 'primereact/passthrough/tailwind';
import Home from "./components/Home/home";

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
          < Home />
        </PrimeReactProvider>
      </UserProvider>
    </AuthProvider>
  );

}