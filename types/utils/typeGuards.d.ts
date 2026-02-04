import BaseBlock from "../blocks/BaseBlock";
import ListBlock from "../blocks/editable/ListBlock";
/**
 * 블록이 ListBlock 인스턴스인지 확인하는 타입 가드
 */
export declare function isListBlock(block: BaseBlock): block is ListBlock;
