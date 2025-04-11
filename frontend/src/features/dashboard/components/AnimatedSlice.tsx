import React from "react";

import { motion } from "framer-motion";

interface AnimatedSliceProps {
  children: React.ReactNode;
  index: number; // Index of the slice for animation
}

const AnimatedSlice: React.FC<AnimatedSliceProps> = ({
  children,
  index = 0,
}) => {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.25 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.25, delay: index * 0.075 },
        scale: {
          type: "spring",
          duration: 0.25,
          bounce: 0.1,
          delay: index * 0.075,
        },
      }}
    >
      {children}
    </motion.g>
  );
};

export default AnimatedSlice;
