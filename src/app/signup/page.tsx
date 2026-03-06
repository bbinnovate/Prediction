import React from 'react'
import Signup from '../components/Signup'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Bombay Blokes Predictions",
  description:
    "Create your account to join the Bombay Blokes office prediction game, vote on daily questions, and start earning points.",
};
const Index = () => {
  return (
    <div >
      <Signup />
    </div>
  )
}

export default Index