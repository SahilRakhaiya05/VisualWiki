"use client";

import { motion } from "framer-motion";

const messages = [
  "Understanding your idea...",
  "Recalling useful context...",
  "Planning the visual layout...",
  "Arranging callout panels...",
  "Creating the image...",
  "Preparing the next visual page..."
];

export function GenerationLoader({
  message = "Creating deeper visual page..."
}: {
  message?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#dcebe6]/78 p-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[1.4rem] border border-[#23352f]/20 bg-[#fffaf0]/95 p-5 shadow-2xl">
        <div className="mb-4 aspect-video overflow-hidden rounded-xl border border-[#23352f]/15 bg-[#edf5f1]">
          <motion.div
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#fffaf0]/80 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "220%" }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          />
        </div>
        <motion.p
          className="ui-font text-sm font-semibold text-[#172b27]"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          {message || messages[Math.floor(Date.now() / 2200) % messages.length]}
        </motion.p>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-2 w-2 rounded-full bg-[#274f46]"
              animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: dot * 0.16 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
