import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
/**
 * 에디터 복사/잘라내기/붙여넣기 이벤트 처리 플러그인
 * - 다중 블록 선택 시 블록 단위 복사/붙여넣기
 * - Range Selection 시 부분 콘텐츠 복사/붙여넣기
 * - 클립보드 데이터 sanitize
 */
export default class CopyPastePlugin extends Plugin {
    private onCopyBound;
    private onCutBound;
    private onPasteBound;
    /** 커스텀 MIME 타입 (에디터 블록 데이터) */
    private static readonly MIME_TYPE;
    constructor(editor: Editor);
    initialize(): void;
    destroy(): void;
    /**
     * 복사 이벤트 처리
     */
    private _onCopy;
    /**
     * 잘라내기 이벤트 처리
     */
    private _onCut;
    /**
     * 붙여넣기 이벤트 처리
     */
    private _onPaste;
    /**
     * 선택된 콘텐츠를 클립보드에 복사
     */
    private _copySelectedContent;
    /**
     * 선택된 콘텐츠를 삭제
     */
    private _deleteSelectedContent;
    /**
     * Range Selection의 콘텐츠를 삭제
     */
    private _deleteRangeSelection;
    /**
     * 텍스트 범위를 삭제
     */
    private _deleteTextRange;
    /**
     * 블록 데이터를 텍스트와 HTML로 변환
     */
    private _blocksToTextAndHtml;
    /**
     * HTML 태그를 제거하고 텍스트만 추출
     */
    private _stripHtml;
    /**
     * 블록 데이터를 붙여넣기
     */
    private _pasteBlocks;
}
