import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

type Props = {
  value: number;
  direction?: "up" | "down";
  className?: string;
};

// AnimatedCount component inline
const AnimatedCount: React.FC<Props> = ({
  value,
  direction = "up",
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === "down" ? 0 : value);
    }
  }, [motionValue, isInView, value, direction]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", latest => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          Math.round(latest),
        );
      }
    });

    return () => unsubscribe();
  }, [springValue]);

  return <span className={className} ref={ref} />;
};

export default AnimatedCount;
