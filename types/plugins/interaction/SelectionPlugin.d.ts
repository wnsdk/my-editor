import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
/**
 * 마우스를 사용한 다중 블록 선택 처리 플러그인
 * - Shift+Click: 범위 선택
 * - Ctrl+Click (또는 Cmd+Click): 개별 블록 선택 토글
 * - 일반 클릭: 기존 선택 해제
 */
export default class SelectionPlugin extends Plugin {
    private onMouseDownBound;
    private onMouseMoveBound;
    private onMouseUpBound;
    /** 드래그 선택 상태 */
    private isDragging;
    /** 드래그 시작 블록 */
    private dragStartBlock;
    constructor(editor: Editor);
    initialize(): void;
    destroy(): void;
    /**
     * 마우스 다운 이벤트 처리
     */
    private _onMouseDown;
    /**
     * 마우스 이동 이벤트 처리 (드래그 선택)
     */
    private _onMouseMove;
    /**
     * 마우스 업 이벤트 처리
     */
    private _onMouseUp;
}
