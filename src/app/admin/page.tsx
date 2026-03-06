import React from 'react'
import Admin from '../components/Admin'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Bombay Blokes Prediction System",
  description:
    "Admin panel for managing users, predictions, and leaderboard data in the Bombay Blokes office prediction platform.",
};
const Index = () => {
  return (
    <div>
      <Admin />
    </div>
  )
}

export default Index