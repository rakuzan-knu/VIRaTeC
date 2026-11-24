import { BORDER_LINES } from './bordersData';
import { decodeOutline, rotate } from './outline';
import type { Camera } from './projection';

const BORDERS = BORDER_LINES.map(decodeOutline);

export function traceBorders(context: CanvasRenderingContext2D, camera: Camera, radius: number) {
  for (const line of BORDERS) {
    let isDrawing = false;
    for (const vector of line) {
      const { x, y, z } = rotate(vector, camera);
      if (z < 0) {
        isDrawing = false;
      } else if (isDrawing) {
        context.lineTo(x * radius, -y * radius);
      } else {
        context.moveTo(x * radius, -y * radius);
        isDrawing = true;
      }
    }
  }
}
