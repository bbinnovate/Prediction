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




// import React from 'react'
// // import LandingPage from './components/LandingPage'

// import type { Metadata } from "next";
// import Button from './components/Button';

// export const metadata: Metadata = {
//   title: "Bombay Blokes Predictions | Office Voting Game",
//   description:
//     "Participate in the Bombay Blokes office prediction game. Vote yes or no on daily questions, earn points for correct answers, and climb the leaderboard against your colleagues.",
// };
// const Index = () => {
//   return (
//          <section className="container h-screen w-full flex justify-center items-center py-0 sm:py-15 lg:py-20">
//   <div className="container bg-[#1D1D1D] rounded-[20px] px-10 py-24 text-center relative overflow-hidden max-w-full w-full">

//     <h2 className="text-3xl text-white mb-6">
//       Daily Predictions
//     </h2>

//     <p className="text-gray-300 mb-4">
//       Once the curator adds today's questions, they will appear here.
//     </p>

//     <p className="text-gray-300 mb-8">
//       Try to solve all the questions before <span className="text-highlight font-semibold">10:00 AM</span>.
//     </p>

//     <div className="absolute right-0 top-0 h-full w-3 sm:w-5 md:w-5 candy-border"></div>

//   </div>
// </section>
//   )
// }

// export default Index