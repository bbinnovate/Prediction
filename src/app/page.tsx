import React from 'react'
import LandingPage from './components/LandingPage'

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bombay Blokes Predictions | Office Voting Game",
  description:
    "Participate in the Bombay Blokes office prediction game. Vote yes or no on daily questions, earn points for correct answers, and climb the leaderboard against your colleagues.",
};
const Index = () => {
  return (
    <div>
      <LandingPage />
    </div>
  )
}

export default Index