import React from 'react'
import ForgotPin from '../components/ForgotPin';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot PIN | Bombay Blokes Predictions",
  description:
    "Recover your Bombay Blokes Predictions account PIN. Enter your registered email to receive your login PIN and access the prediction platform.",
};
const Index = () => {
  return (
    <div>
      <ForgotPin />
    </div>
  )
}

export default Index