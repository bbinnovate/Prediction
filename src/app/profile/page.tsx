import React from 'react'
import Profile from '../components/Profile'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Bombay Blokes Predictions",
  description:
    "View your profile, track your prediction scores, monitor your ranking, and stay ahead on the Bombay Blokes leaderboard.",
};
const Index = () => {
  return (
    <div>
        <Profile/>
    </div>
  )
}

export default Index