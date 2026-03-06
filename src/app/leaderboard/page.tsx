import React from 'react'
import Leaderboard from '../components/Leaderboard'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | Bombay Blokes Prediction Game",
  description:
    "View the Bombay Blokes predictions leaderboard. Track employee rankings, scores, and see who leads the office prediction challenge.",
};
const Index = () => {
  return (
    <div>
        <Leaderboard />
    </div>
  )
}

export default Index