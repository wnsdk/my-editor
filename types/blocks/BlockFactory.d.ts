import { BlockConstructor, BlockInit, ToolType } from "../types";
/**
 * 새로운 블록 타입을 등록합니다.
 */
export declare function registerBlock<TConfig>(type: ToolType, constructor: BlockConstructor<TConfig>): void;
/**
 * 새 블록 생성합니다.
 */
export declare function createBlock<TConfig>(type: ToolType, data: any | undefined, init: BlockInit<TConfig>): import("./BaseBlock").default;
/**
 * JSON 데이터로부터 블록을 생성합니다.
 */
export declare function createBlockFromJSON<TConfig>(data: any, init: BlockInit<TConfig>): import("./BaseBlock").default;
/**
 * 에디터의 초기 상태를 위한 기본 블록(텍스트 블록)을 생성합니다.
 */
export declare function createDefaultBlocks<TConfig>(init: BlockInit<TConfig>): import("./BaseBlock").default[];
