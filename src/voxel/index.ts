export { BLOCK_COLORS } from './Palette';
export { getMaterial, clearMaterialCache } from './Materials';
export type { BlockColorKey } from './Materials';
export {
  registerVoxelBuilder,
  getVoxelBuilder,
  hasVoxelBuilder,
  createBlock,
  createVoxelGroup,
} from './VoxelBuilder';
export type { VoxelBuilderFn } from './VoxelBuilder';
export { buildRoom } from './RoomBuilder';
export { buildFurniture } from './FurnitureBuilder';
export { buildProp } from './PropsBuilder';
export { buildDecoration } from './DecorationBuilder';

// Import builders to trigger registration at module load
import './FurnitureBuilder';
import './PropsBuilder';
import './DecorationBuilder';
