import {BlockConstructor, BlockInit, ToolConfig, ToolType} from "../types";

/**
 * 블록 생성 및 관리를 위한 팩토리 모듈입니다.
 * 등록된 블록 타입에 따라 새로운 블록 인스턴스를 생성합니다.
 */

const blockRegistry: Record<string, BlockConstructor> = {}; // 블록 생성자를 저장하는 레지스트리

/**
 * 새로운 블록 타입을 등록합니다.
 */
export function registerBlock<TConfig>(type: ToolType, constructor: BlockConstructor<TConfig>): void {
    if (blockRegistry[type]) {
        console.warn(`Block type "${type}" is already registered. Overwriting.`);
    }
    blockRegistry[type] = constructor;
}

/**
 * 새 블록 생성합니다.
 */
export function createBlock<TConfig>(type: ToolType, data: any = {}, init: BlockInit<TConfig>) {
    const BlockConstructor = blockRegistry[type];
    if (!BlockConstructor) {
        throw new Error(`BlockFactory: Unknown block type "${type}". Please ensure it is registered.`);
    }
    return new BlockConstructor(data, init);
}

/**
 * JSON 데이터로부터 블록을 생성합니다.
 */
export function createBlockFromJSON<TConfig>(data: any, init: BlockInit<TConfig>) {
    if (!data || !data.type) {
        throw new Error("BlockFactory: Invalid JSON data for block creation. 'type' property is missing.");
    }
    const BlockConstructor = blockRegistry[data.type];
    if (!BlockConstructor) {
        throw new Error(`BlockFactory: Unknown block type "${data.type}" from JSON. Please ensure it is registered.`);
    }
    return new BlockConstructor(data, init);
}

/**
 * 에디터의 초기 상태를 위한 기본 블록(텍스트 블록)을 생성합니다.
 */
export function createDefaultBlocks<TConfig>(init: BlockInit<TConfig>) {
    // 'text' 블록은 TextBlockPlugin에서 등록될 것으로 예상됩니다.
    return [createBlock("text", "", init)];
}
