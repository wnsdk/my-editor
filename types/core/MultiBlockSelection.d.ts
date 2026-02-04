/**
 * 다중 블록 선택 및 Range Selection을 관리하는 클래스입니다.
 *
 * Selection 유형:
 * 1. Collapsed Selection: 캐럿이 한 위치에 있음 (텍스트 편집 모드)
 * 2. Range Selection: 여러 블록에 걸친 콘텐츠 선택 (Shift+Click, Shift+Arrow)
 * 3. Block Selection: 전체 블록 단위 선택 (Ctrl+Click, Ctrl+A)
 */
import Editor from "./Editor";
import BaseBlock from "../blocks/BaseBlock";
import { BaseBlockData } from "../types";
export interface SelectionRange {
    /** 선택 시작 블록 */
    startBlock: BaseBlock;
    /** 선택 시작 위치 (텍스트 블록의 경우 오프셋, 비텍스트 블록은 0) */
    startOffset: number;
    /** 선택 끝 블록 */
    endBlock: BaseBlock;
    /** 선택 끝 위치 */
    endOffset: number;
}
export type SelectionType = 'collapsed' | 'range' | 'block';
export default class MultiBlockSelection {
    private editor;
    /** 현재 선택된 블록들의 ID 집합 (Block Selection 모드) */
    private selectedBlockIds;
    /** Range Selection 상태 */
    private rangeSelection;
    /** 현재 선택 유형 */
    private selectionType;
    /** Range Selection 시작 앵커 */
    private anchorBlock;
    private anchorOffset;
    constructor(editor: Editor);
    /**
     * 현재 선택 유형을 반환합니다.
     */
    getSelectionType(): SelectionType;
    /**
     * 선택된 블록 ID 목록을 반환합니다.
     */
    getSelectedBlockIds(): string[];
    /**
     * 선택된 블록 인스턴스들을 반환합니다.
     */
    getSelectedBlocks(): BaseBlock[];
    /**
     * Range Selection 정보를 반환합니다.
     */
    getRangeSelection(): SelectionRange | null;
    /**
     * 선택이 활성화되어 있는지 확인합니다.
     */
    hasSelection(): boolean;
    /**
     * 단일 블록을 선택합니다 (Block Selection 모드).
     */
    selectBlock(block: BaseBlock, addToSelection?: boolean): void;
    /**
     * 블록 선택을 토글합니다 (Ctrl+Click).
     */
    toggleBlockSelection(block: BaseBlock): void;
    /**
     * 범위 내의 모든 블록을 선택합니다 (Shift+Click).
     */
    selectBlockRange(fromBlock: BaseBlock, toBlock: BaseBlock): void;
    /**
     * Range Selection을 시작합니다 (앵커 설정).
     */
    startRangeSelection(block: BaseBlock, offset?: number): void;
    /**
     * Range Selection을 확장합니다.
     */
    extendRangeSelection(toBlock: BaseBlock, toOffset?: number): void;
    /**
     * 모든 블록을 선택합니다 (Ctrl+A).
     */
    selectAll(): void;
    /**
     * 선택을 모두 해제합니다.
     */
    clearSelection(): void;
    /**
     * 선택된 블록들을 삭제합니다.
     */
    deleteSelectedBlocks(): void;
    /**
     * 선택된 콘텐츠를 직렬화합니다 (복사/잘라내기용).
     */
    serializeSelection(): BaseBlockData[];
    /**
     * Range Selection의 콘텐츠를 직렬화합니다.
     */
    private _serializeRangeSelection;
    /**
     * HTML 텍스트에서 특정 범위를 추출합니다.
     */
    private _extractTextRange;
    /**
     * Block Selection UI를 업데이트합니다.
     */
    private _updateBlockSelectionUI;
    /**
     * Range Selection UI를 업데이트합니다.
     */
    private _updateRangeSelectionUI;
    /**
     * 네이티브 Selection API를 사용하여 범위 선택을 시각화합니다.
     */
    private _applyNativeRangeSelection;
    /**
     * 특정 오프셋에 해당하는 텍스트 노드를 찾습니다.
     */
    private _getTextNodeAtOffset;
    /**
     * Selection UI를 초기화합니다.
     */
    private _clearSelectionUI;
    /**
     * 리소스를 정리합니다.
     */
    destroy(): void;
}
