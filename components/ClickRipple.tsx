"use client";

import { motion } from "framer-motion";

export function ClickRipple({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.68 }}
      animate={{ scale: 3, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="pointer-events-none absolute h-12 w-12 rounded-full border-2 border-[#274f46]"
      style={{ left: x - 24, top: y - 24 }}
    />
  );
}
