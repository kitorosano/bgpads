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

export const truncateFilename = (filePath: string, maxLength = 18): string => {
  // Extract just the filename from the full path
  const filename = filePath.replace(/\\/g, '/').split('/').pop() || filePath;
  if (filename.length <= maxLength) return filename;

  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) {
    // No extension — just truncate with ellipsis
    return filename.slice(0, maxLength - 1) + '…';
  }

  const ext = filename.slice(dotIndex); // e.g. ".mp3"
  const name = filename.slice(0, dotIndex);
  const availableChars = maxLength - ext.length - 1; // -1 for the ellipsis

  if (availableChars <= 2) {
    // Very long extension or very short max — just show what we can
    return filename.slice(0, maxLength - 1) + '…';
  }

  return name.slice(0, availableChars) + '…' + ext;
};
