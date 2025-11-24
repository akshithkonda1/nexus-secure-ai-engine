import { motion, type MotionProps } from "framer-motion";
import type { PropsWithChildren } from "react";

export function FadeIn({ children, ...props }: PropsWithChildren<MotionProps>) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} {...props}>
      {children}
    </motion.div>
  );
}
