import React from 'react'
import Curator from '../components/Curator'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curator Panel | Bombay Blokes Predictions",
  description:
    "Curator dashboard for the Bombay Blokes prediction platform. Add daily prediction questions and set correct answers to calculate player scores.",
};
const Index = () => {
  return (
    <div>
      <Curator />
    </div>
  )
}

export default Index