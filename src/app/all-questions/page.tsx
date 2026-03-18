import React from 'react'
import AllQuestions from '../components/AllQuestions'

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Questions | Admin Panel - Bombay Blokes",
  description:
    "View and manage all daily prediction questions and answers. Accessible only to admins for reviewing and controlling content.",
};
const Index = () => {
  return (
    <div>
        <AllQuestions/>
    </div>
  )
}

export default Index