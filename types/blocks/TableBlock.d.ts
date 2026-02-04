import BaseBlock from "./BaseBlock";
import { BlockInit, TableBlockData, TableCellData } from "../types/blocks";
import { TableToolConfig } from "../types/tools";
/**
 * 에디터의 테이블 블록을 나타내는 클래스입니다.
 * 행/열 추가/삭제, 열 너비 드래그 조절 기능을 제공합니다.
 */
export default class TableBlock extends BaseBlock {
    rows: TableCellData[][];
    colWidths: number[];
    private config;
    private api;
    private tableEl;
    private isResizing;
    private resizingColIndex;
    private startX;
    private startWidth;
    /**
     * 기본 테이블 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(init: BlockInit<TableToolConfig>): TableBlock;
    /**
     * 데이터를 기반으로 테이블 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: TableBlockData, init: BlockInit<TableToolConfig>): TableBlock;
    constructor(data: Partial<TableBlockData>, init: BlockInit<TableToolConfig>);
    /**
     * 빈 테이블 데이터를 생성합니다.
     */
    private _createEmptyRows;
    /**
     * 테이블 DOM을 렌더링합니다.
     */
    private _render;
    /**
     * 테이블 조작 툴바를 렌더링합니다.
     */
    private _renderToolbar;
    /**
     * 이벤트 핸들러를 바인딩합니다.
     */
    private _bindEvents;
    /**
     * 이벤트 핸들러를 해제합니다.
     */
    private _unbindEvents;
    /**
     * 셀 입력 이벤트를 처리합니다.
     */
    private _onCellInput;
    /**
     * 키보드 이벤트를 처리합니다 (방향키 이동).
     */
    private _onKeyDown;
    /**
     * 커서가 셀의 시작 위치에 있는지 확인합니다.
     */
    private _isCursorAtStart;
    /**
     * 커서가 셀의 끝 위치에 있는지 확인합니다.
     */
    private _isCursorAtEnd;
    /**
     * 요소의 첫 번째 텍스트 노드를 가져옵니다.
     */
    private _getFirstTextNode;
    /**
     * 요소의 마지막 텍스트 노드를 가져옵니다.
     */
    private _getLastTextNode;
    /**
     * 특정 셀로 포커스를 이동합니다.
     */
    private _moveFocusToCell;
    /**
     * 툴바 버튼 클릭을 처리합니다.
     */
    private _onToolbarClick;
    /**
     * 열 리사이즈를 시작합니다.
     */
    private _onResizeStart;
    /**
     * 열 리사이즈 중 마우스 이동을 처리합니다.
     */
    private _onResizeMove;
    /**
     * 열 리사이즈를 종료합니다.
     */
    private _onResizeEnd;
    /**
     * 특정 열의 너비를 업데이트합니다.
     */
    private _updateColumnWidth;
    /**
     * 행을 추가합니다.
     */
    addRow(index?: number): void;
    /**
     * 열을 추가합니다.
     */
    addColumn(index?: number): void;
    /**
     * 행을 삭제합니다.
     */
    deleteRow(index?: number): void;
    /**
     * 열을 삭제합니다.
     */
    deleteColumn(index?: number): void;
    /**
     * 테이블을 다시 렌더링합니다.
     */
    private _refreshTable;
    /**
     * 블록이 비어있는지 확인합니다.
     */
    isEmpty(): boolean;
    /**
     * 블록에 포커스를 설정합니다.
     */
    focus(event?: Event): void;
    /**
     * 테이블 블록을 JSON으로 직렬화합니다.
     */
    toJSON(): TableBlockData;
}
