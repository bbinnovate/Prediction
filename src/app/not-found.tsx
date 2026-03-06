import type { Metadata } from "next";
import Link from "next/link";
import Button from "./components/Button";
export const metadata: Metadata = {
  title: "Page Not Found | Bombay Blokes Predictions",
  description:
    "The page you are looking for does not exist. Return to the Bombay Blokes predictions homepage.",
};

export default function NotFound() {
  return (
    <section className=" h-screen flex items-center justify-center">
      <div className="bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-xl w-full">

        <h1 className="text-6xl font-bold text-highlight mb-6">
          404
        </h1>

        <h2 className="text-2xl text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mb-8">
          The page you are looking for doesn't exist.
        </p>
          <Button
            text="Go Back Home"
            href="/"
            className="white-text"
          />
       

        <div className="absolute right-0 top-0 h-full w-3 sm:w-5 candy-border"></div>

      </div>
    </section>
  );
}