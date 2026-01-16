"use client";

import { useEffect, useState } from "react";

interface FeedGreetingProps {
  name: string;
}

export default function FeedGreeting({ name }: FeedGreetingProps) {
  const [greeting, setGreeting] = useState("Good Day");
  const [subtitle, setSubtitle] = useState("Ready to taste something homemade today?");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) {
        setGreeting("Good Late Night");
        setSubtitle("Craving a late night snack?");
    } else if (hour < 12) {
      setGreeting("Good Morning");
      setSubtitle("Start your day with a healthy breakfast!");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
      setSubtitle("Recharge with a delicious homemade lunch.");
    } else {
      setGreeting("Good Evening");
      setSubtitle("Relax and enjoy a comforting dinner.");
    }
  }, []);

  return (
    <div className="mb-1">
      <h1 className="text-xl md:text-2xl font-bold text-teal-900">
        {greeting}, <span className="text-yellow-500">{name}!</span> 👋
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        {subtitle}
      </p>
    </div>
  );
}
