import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
/**
 * 키보드 입력(엔터, 백스페이스, 딜리트, 방향키)을 처리하여 에디터의 블록을 조작하는 플러그인입니다.
 */
export default class KeyHandlerPlugin extends Plugin {
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 에디터 루트에 키다운 이벤트 리스너를 등록합니다.
     */
    initialize(): void;
    private _onKeyDown;
    /**
     * 새 텍스트 블록을 생성하거나 블록을 분할합니다.
     */
    private _handleEnter;
    /**
     * 리스트 블록에서의 엔터 입력을 처리합니다.
     */
    private _handleListEnter;
    /**
     * 모든 리스트 블록을 순회하며 순서가 있는 리스트의 번호를 갱신합니다.
     */
    private _updateSequentialListNumbers;
    /**
     * Shift+방향키로 범위 선택을 확장합니다.
     */
    private _handleShiftArrowKeys;
    /**
     * 현재 캐럿의 텍스트 오프셋을 반환합니다.
     */
    private _getCurrentCaretOffset;
    /**
     * 블록의 전체 텍스트 길이를 반환합니다.
     */
    private _getBlockTextLength;
    /**
     * 방향키 이벤트를 처리하여 블록 간 또는 블록 내 캐럿을 이동합니다.
     */
    private _handleArrowKeys;
    /**
     * 백스페이스 키 이벤트를 처리하여 블록을 삭제하거나 병합합니다.
     */
    private _handleBackspace;
    /**
     * 딜리트 키 이벤트를 처리하여 블록을 삭제하거나 병합합니다.
     */
    private _handleDelete;
    /**
     * 블록 삭제 후 적절한 블록으로 포커스를 이동하는 헬퍼 메서드입니다.
     */
    private _handleBlockDeletionAndFocus;
    /**
     * 캐럿이 현재 텍스트 블록의 경계(맨 위/아래 라인, 맨 왼쪽/오른쪽 끝)에 있는지 확인합니다.
     */
    private _isCaretAtBlockBoundary;
}
