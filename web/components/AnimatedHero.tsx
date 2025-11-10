import React, { useEffect, useState } from "react";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
}

export default function AnimatedHero({ title, subtitle }: AnimatedHeroProps) {
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroTranslateY, setHeroTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const navHeight = 64;
      const heroHeight = 400;

      const newOpacity = 1 - scrollY / (heroHeight - navHeight);
      setHeroOpacity(Math.max(0, newOpacity));
      setHeroTranslateY(scrollY * 0.4);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="headline">
      <div
        className="inner"
        style={{
          opacity: heroOpacity,
          transform: `translate(-50%, calc(-50% + ${heroTranslateY}px))`,
        }}
      >
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
