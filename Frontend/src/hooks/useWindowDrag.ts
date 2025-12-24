/**
 * Window Drag Hook
 * Handles dragging and resizing windows
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Position, Size } from '../types/workspace';

type UseDragOptions = {
  initialPosition: Position;
  onDragEnd?: (position: Position) => void;
  bounds?: {
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
  };
  magnetic?: boolean;
  magneticThreshold?: number;
};

export function useWindowDrag({
  initialPosition,
  onDragEnd,
  bounds,
  magnetic = true,
  magneticThreshold = 10,
}: UseDragOptions) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position | null>(null);
  const elementStart = useRef<Position | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = position;
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart.current || !elementStart.current) return;

      let newX = elementStart.current.x + (e.clientX - dragStart.current.x);
      let newY = elementStart.current.y + (e.clientY - dragStart.current.y);

      // Apply bounds
      if (bounds) {
        if (bounds.minX !== undefined) newX = Math.max(bounds.minX, newX);
        if (bounds.minY !== undefined) newY = Math.max(bounds.minY, newY);
        if (bounds.maxX !== undefined) newX = Math.min(bounds.maxX, newX);
        if (bounds.maxY !== undefined) newY = Math.min(bounds.maxY, newY);
      }

      // Magnetic edge snapping
      if (magnetic && typeof window !== 'undefined') {
        const threshold = magneticThreshold;

        // Left edge
        if (newX < threshold) newX = 0;
        // Top edge
        if (newY < threshold) newY = 0;
        // Right edge (assuming 400px window width)
        if (window.innerWidth - newX - 400 < threshold) {
          newX = window.innerWidth - 400;
        }
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
      elementStart.current = null;
      if (onDragEnd) {
        onDragEnd(position);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, onDragEnd, bounds, magnetic, magneticThreshold]);

  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
}

type UseResizeOptions = {
  initialSize: Size;
  minSize?: Size;
  maxSize?: Size;
  onResizeEnd?: (size: Size) => void;
};

export function useWindowResize({
  initialSize,
  minSize = { width: 280, height: 300 },
  maxSize,
  onResizeEnd,
}: UseResizeOptions) {
  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const resizeStart = useRef<{ x: number; y: number } | null>(null);
  const sizeStart = useRef<Size | null>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(direction);
      resizeStart.current = { x: e.clientX, y: e.clientY };
      sizeStart.current = size;
    },
    [size]
  );

  useEffect(() => {
    if (!isResizing || !resizeStart.current || !sizeStart.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStart.current || !sizeStart.current) return;

      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;

      let newWidth = sizeStart.current.width;
      let newHeight = sizeStart.current.height;

      // Apply deltas based on direction
      if (resizeDirection.includes('e')) {
        newWidth = sizeStart.current.width + deltaX;
      }
      if (resizeDirection.includes('w')) {
        newWidth = sizeStart.current.width - deltaX;
      }
      if (resizeDirection.includes('s')) {
        newHeight = sizeStart.current.height + deltaY;
      }
      if (resizeDirection.includes('n')) {
        newHeight = sizeStart.current.height - deltaY;
      }

      // Apply size constraints
      newWidth = Math.max(minSize.width, newWidth);
      newHeight = Math.max(minSize.height, newHeight);

      if (maxSize) {
        newWidth = Math.min(maxSize.width, newWidth);
        newHeight = Math.min(maxSize.height, newHeight);
      }

      // Viewport constraints
      if (typeof window !== 'undefined') {
        newWidth = Math.min(window.innerWidth * 0.9, newWidth);
        newHeight = Math.min(window.innerHeight * 0.9, newHeight);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection('');
      resizeStart.current = null;
      sizeStart.current = null;
      if (onResizeEnd) {
        onResizeEnd(size);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, size, minSize, maxSize, onResizeEnd]);

  // Update size when initialSize changes
  useEffect(() => {
    setSize(initialSize);
  }, [initialSize.width, initialSize.height]);

  return {
    size,
    isResizing,
    handleResizeStart,
  };
}
