import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full  ">
      <div className=" mx-auto  container py-5 mt-3 ">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-start lg:gap-8 gap-4 text-left">
          {/* Logo */}
          <div className="hidden sm:flex justify-start relative">


  {/* LOGO */}
  <Link href="/">
    <Image
      src="/images/bblogo.webp"
      alt="Bombay Blokes Logo"
      width={250}
      height={60}
      className="object-contain"
    />
  </Link>

</div>

        </div>

        {/* Bottom Section */}
        <div className="body4 lg:mt-6 mt-2 border-t pt-4 lg:pt-1 flex flex-col gap-4 md:flex-row md:justify-between md:items-center black-text text-sm">
          {/* Links */}
         <div className="flex flex-wrap items-start gap-1 md:gap-3 md:order-2">
  <Link
    href="https://bombayblokes.com"
    className="black-text transition-colors border-r border-gray-400 pr-2 hover:text-[var(--color-highlight)]"
  >
    Home
  </Link>
  <Link
    href="https://bombayblokes.com/clients"
    className="black-text transition-colors border-r border-gray-400 pr-2 hover:text-[var(--color-highlight)]"
  >
    Our Clients
  </Link>
  <Link
    href="https://bombayblokes.com/contactus"
    className="black-text transition-colors border-r border-gray-400 pr-2 hover:text-[var(--color-highlight)]"
  >
    Contact
  </Link>
  <Link
    href="https://bombayblokes.com/client-registration"
    className="black-text transition-colors border-r border-gray-400 pr-2 hover:text-[var(--color-highlight)]"
  >
    Client Registration
  </Link>
  <Link
    href="https://bombayblokes.com/blogs"
    className="black-text transition-colors border-r border-gray-400 pr-2 hover:text-[var(--color-highlight)]"
  >
    Blogs
  </Link>
  <Link
    href="https://bombayblokes.com/privacy"
    className="black-text transition-colors border-r border-gray-400 pr-2 hover:text-[var(--color-highlight)]"
  >
    Privacy Policy
  </Link>
  <Link
    href="https://bombayblokes.com/terms"
    className="black-text transition-colors"
  >
    Terms & Conditions 
  </Link>

</div>

          {/* Copyright */}
          <p className="text-left md:order-1 mt-2 body4">
  Copyright ©{new Date().getFullYear()} Bombay Blokes. All rights reserved.
</p>

        </div>
      </div>
    </footer>
  );
}
