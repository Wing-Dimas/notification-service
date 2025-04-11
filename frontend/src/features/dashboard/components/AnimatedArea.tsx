import React from "react";
import { motion } from "motion/react";

const AnimatedArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.g
      initial={{ clipPath: "inset(0% 100% 0% 0%)" }} // Animates from right
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }} // To original position
      transition={{
        duration: 1, // Adjust duration as needed
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.g>
  );
};

export default AnimatedArea;
