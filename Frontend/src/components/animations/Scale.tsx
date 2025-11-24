import { motion, type MotionProps } from "framer-motion";
import type { PropsWithChildren } from "react";

export function Scale({ children, ...props }: PropsWithChildren<MotionProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
