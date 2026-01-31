import BaseBlock from "../blocks/BaseBlock";
import ListBlock from "../blocks/ListBlock";

/**
 * 블록이 ListBlock 인스턴스인지 확인하는 타입 가드
 */
export function isListBlock(block: BaseBlock): block is ListBlock {
    return block.type === 'list' && 'refreshListContent' in block;
}
