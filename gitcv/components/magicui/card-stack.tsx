"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

let interval: any;

type Card = {
  id: number;
  role: string;
  selectedProjects: string[];
  focus: string[];
  score: string;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset ?? 10;
  const SCALE_FACTOR = scaleFactor ?? 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative h-[14rem] md:h-60 w-full md:w-96 mx-auto">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-white h-[14rem] md:h-60 w-full md:w-96 rounded-3xl p-4 shadow-xl border border-neutral-200 flex flex-col justify-between transform-gpu dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
          >
            <div className="rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base md:text-lg">
                {card.role}
                </h3>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {card.score} Match
                </span>
            </div>

            <div className="mt-3 space-y-2 text-sm md:text-sm">
                {card.selectedProjects.map((project) => (
                <div
                    key={project}
                    className="flex items-center gap-2"
                >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate">{project}</span>
                </div>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {card.focus.map((tag) => (
                <span
                    key={tag}
                    className="rounded-full bg-emerald-500/40 px-2.5 py-1 text-xs"
                >
                    {tag}
                </span>
                ))}
            </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
