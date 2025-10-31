import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { useBrand } from "@/shared/ui/useBrand";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  const { logo, alt } = useBrand();

  return (
    <motion.img
      src={logo}
      alt={alt}
      data-testid="brand-mark"
      className={cn("h-7 w-auto select-none", className)}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
