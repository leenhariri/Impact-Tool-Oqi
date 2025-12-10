type Props = {
  title: string;
  subtitle?: string;
  animate?: boolean; // true = animate on scroll like homepage
};

import { useEffect, useState } from "react";

export default function PageHero({ title, subtitle, animate = false }: Props) {
  const [opacity, setOpacity] = useState(1);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const navHeight = 64;
      const heroHeight = 400;

      const newOpacity = 1 - scrollY / (heroHeight - navHeight);
      setOpacity(Math.max(0, newOpacity));
      setTranslateY(scrollY * 0.4);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [animate]);

  return (
    <header className="headline">
      <div
        className="inner"
        style={
          animate
            ? {
                opacity,
                transform: `translate(-50%, calc(-50% + ${translateY}px))`,
              }
            : undefined
        }
      >
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}
