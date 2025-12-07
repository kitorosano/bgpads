import { Dimensions, Point } from '@renderer/types';

export const calculateMenuPosition = (
  position: Point,
  menuDimensions: Dimensions,
  windowDimensions: Dimensions
): Point => {
  let newX = position.x;
  let newY = position.y;

  // Adjust horizontal position
  if (newX + menuDimensions.width > windowDimensions.width) {
    newX = windowDimensions.width - menuDimensions.width - 10;
  }
  if (newX < 10) newX = 10;

  // Adjust vertical position
  if (newY + menuDimensions.height > windowDimensions.height) {
    newY = windowDimensions.height - menuDimensions.height - 10;
  }
  if (newY < 10) newY = 10;

  return { x: newX, y: newY };
};
