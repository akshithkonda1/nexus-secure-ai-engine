import { motion, type MotionProps } from "framer-motion";
import type { PropsWithChildren } from "react";

export function SlideUp({ children, ...props }: PropsWithChildren<MotionProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
