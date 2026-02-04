import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
/**
 * 드래그 앤 드롭을 통해 에디터 블록의 순서를 변경하는 기능을 제공하는 플러그인입니다.
 */
export default class DragDropHandlerPlugin extends Plugin {
    private draggingBlockEl;
    private draggingBlockId;
    private dragOverBlockEl;
    private dropPosition;
    private dragIndicatorEl;
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 에디터 루트에 드래그 앤 드롭 관련 이벤트 리스너를 등록합니다.
     */
    initialize(): void;
    private _onDragStart;
    private _onDragOver;
    private _onDragLeave;
    private _onDrop;
    private _onDragEnd;
    /**
     * 블록 배열 내에서 블록의 순서를 재정렬합니다.
     */
    private _reorderBlocks;
    /**
     * 드래그 인디케이터가 DOM에 존재하는지 확인하고 없으면 생성합니다.
     */
    private _ensureDragIndicatorExists;
    /**
     * 드롭 위치를 계산하고 해당 위치의 인디케이터 상단 좌표를 반환합니다.
     */
    private _calculateDropPosition;
    /**
     * 드래그 인디케이터의 위치와 스타일을 업데이트하여 표시합니다.
     * @param indicatorTop - 인디케이터의 top 위치 (에디터 루트 기준)
     */
    private _updateDragIndicator;
    /**
     * 드래그 오버 시 표시되는 스타일(인디케이터)을 제거합니다.
     */
    private _clearDragOverStyles;
}
