import React from 'react'
import Login from '../components/Login'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Bombay Blokes Predictions",
  description:
    "Login to the Bombay Blokes prediction platform to participate in daily office predictions and compete on the leaderboard.",
};
const Index = () => {
  return (
    <div>
      <Login />
    </div>
  )
}

export default Index