import BaseBlock from "./BaseBlock";
import { BlockInit, TableBlockData, TableCellData } from "../types/blocks";
import { TableToolConfig } from "../types/tools";
import { setBlockId } from "../utils/dom";

/**
 * 에디터의 테이블 블록을 나타내는 클래스입니다.
 * 행/열 추가/삭제, 열 너비 드래그 조절 기능을 제공합니다.
 */
export default class TableBlock extends BaseBlock {
    public rows: TableCellData[][];
    public colWidths: number[];

    private config: Partial<TableToolConfig>;
    private api: BlockInit["api"];
    private tableEl: HTMLTableElement | null = null;

    // 열 너비 조절 관련 상태
    private isResizing: boolean = false;
    private resizingColIndex: number = -1;
    private startX: number = 0;
    private startWidth: number = 0;

    /**
     * 기본 테이블 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(init: BlockInit<TableToolConfig>): TableBlock {
        return new TableBlock({}, init);
    }

    /**
     * 데이터를 기반으로 테이블 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: TableBlockData, init: BlockInit<TableToolConfig>): TableBlock {
        return new TableBlock(data, init);
    }

    constructor(data: Partial<TableBlockData>, init: BlockInit<TableToolConfig>) {
        super("table", data.depth || 0);

        this.config = init.config;
        this.api = init.api;

        const defaultRows = this.config.defaultRows || 2;
        const defaultCols = this.config.defaultCols || 2;

        // 데이터 초기화
        if (data.rows && data.rows.length > 0) {
            this.rows = data.rows;
        } else {
            this.rows = this._createEmptyRows(defaultRows, defaultCols);
        }

        const colCount = this.rows[0]?.length || defaultCols;
        this.colWidths = data.colWidths || Array(colCount).fill(120);

        this._render();
        this._bindEvents();
    }

    /**
     * 빈 테이블 데이터를 생성합니다.
     */
    private _createEmptyRows(rowCount: number, colCount: number): TableCellData[][] {
        const rows: TableCellData[][] = [];
        for (let i = 0; i < rowCount; i++) {
            const row: TableCellData[] = [];
            for (let j = 0; j < colCount; j++) {
                row.push({ html: "" });
            }
            rows.push(row);
        }
        return rows;
    }

    /**
     * 테이블 DOM을 렌더링합니다.
     */
    private _render(): void {
        // 래퍼 생성
        this.el = document.createElement("div");
        this.el.className = "block table-block-wrapper";
        this.el.contentEditable = "false";

        // 테이블 컨테이너 (가로 스크롤용)
        const container = document.createElement("div");
        container.className = "table-container";

        // 테이블 생성
        this.tableEl = document.createElement("table");
        this.tableEl.className = "table-block";

        // colgroup으로 열 너비 설정
        const colgroup = document.createElement("colgroup");
        this.colWidths.forEach(width => {
            const col = document.createElement("col");
            col.style.width = `${width}px`;
            colgroup.appendChild(col);
        });
        this.tableEl.appendChild(colgroup);

        // tbody 생성
        const tbody = document.createElement("tbody");
        this.rows.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            row.forEach((cell, colIndex) => {
                const td = document.createElement("td");
                td.dataset["row"] = String(rowIndex);
                td.dataset["col"] = String(colIndex);

                // 셀 내용 영역
                const cellContent = document.createElement("div");
                cellContent.className = "table-cell-content";
                if (!this.api.editor.readOnly) {
                    cellContent.contentEditable = "true";
                }
                cellContent.innerHTML = cell.html || "<br>";
                td.appendChild(cellContent);

                // 열 리사이즈 핸들 (마지막 열 제외)
                if (colIndex < row.length - 1 && !this.api.editor.readOnly) {
                    const resizeHandle = document.createElement("div");
                    resizeHandle.className = "col-resize-handle";
                    resizeHandle.dataset["colIndex"] = String(colIndex);
                    td.appendChild(resizeHandle);
                }

                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        this.tableEl.appendChild(tbody);

        container.appendChild(this.tableEl);
        this.el.appendChild(container);

        // 툴바 추가 (readOnly가 아닐 때)
        if (!this.api.editor.readOnly) {
            this._renderToolbar();
        }
    }

    /**
     * 테이블 조작 툴바를 렌더링합니다.
     */
    private _renderToolbar(): void {
        if (!this.el) return;

        const toolbar = document.createElement("div");
        toolbar.className = "table-toolbar";
        toolbar.innerHTML = `
            <button data-action="add-row" title="행 추가">+ 행</button>
            <button data-action="add-col" title="열 추가">+ 열</button>
            <button data-action="delete-row" title="행 삭제">- 행</button>
            <button data-action="delete-col" title="열 삭제">- 열</button>
            <button data-action="delete-table" title="테이블 삭제">삭제</button>
        `;

        toolbar.addEventListener("click", this._onToolbarClick);
        this.el.appendChild(toolbar);
    }

    /**
     * 이벤트 핸들러를 바인딩합니다.
     */
    private _bindEvents(): void {
        if (!this.el) return;

        // 셀 입력 이벤트
        this.el.addEventListener("input", this._onCellInput);

        // 열 리사이즈 이벤트
        this.el.addEventListener("mousedown", this._onResizeStart);
        document.addEventListener("mousemove", this._onResizeMove);
        document.addEventListener("mouseup", this._onResizeEnd);
    }

    /**
     * 이벤트 핸들러를 해제합니다.
     */
    private _unbindEvents(): void {
        document.removeEventListener("mousemove", this._onResizeMove);
        document.removeEventListener("mouseup", this._onResizeEnd);
    }

    /**
     * 셀 입력 이벤트를 처리합니다.
     */
    private _onCellInput = (e: Event): void => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains("table-cell-content")) return;

        const td = target.closest("td");
        if (!td) return;

        const rowIndex = parseInt(td.dataset["row"] || "0", 10);
        const colIndex = parseInt(td.dataset["col"] || "0", 10);

        if (this.rows[rowIndex] && this.rows[rowIndex][colIndex]) {
            this.rows[rowIndex][colIndex].html = target.innerHTML;
        }
    };

    /**
     * 툴바 버튼 클릭을 처리합니다.
     */
    private _onToolbarClick = (e: Event): void => {
        const target = e.target as HTMLElement;
        const action = target.dataset["action"];
        if (!action) return;

        e.preventDefault();
        e.stopPropagation();

        switch (action) {
            case "add-row":
                this.addRow();
                break;
            case "add-col":
                this.addColumn();
                break;
            case "delete-row":
                this.deleteRow();
                break;
            case "delete-col":
                this.deleteColumn();
                break;
            case "delete-table":
                this.api.removeBlock(this);
                break;
        }
    };

    /**
     * 열 리사이즈를 시작합니다.
     */
    private _onResizeStart = (e: MouseEvent): void => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains("col-resize-handle")) return;

        e.preventDefault();

        this.isResizing = true;
        this.resizingColIndex = parseInt(target.dataset["colIndex"] || "0", 10);
        this.startX = e.clientX;
        this.startWidth = this.colWidths[this.resizingColIndex] ?? 100;

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    /**
     * 열 리사이즈 중 마우스 이동을 처리합니다.
     */
    private _onResizeMove = (e: MouseEvent): void => {
        if (!this.isResizing) return;

        const diff = e.clientX - this.startX;
        const minWidth = this.config.minCellWidth || 50;
        const newWidth = Math.max(minWidth, this.startWidth + diff);

        this.colWidths[this.resizingColIndex] = newWidth;
        this._updateColumnWidth(this.resizingColIndex, newWidth);
    };

    /**
     * 열 리사이즈를 종료합니다.
     */
    private _onResizeEnd = (): void => {
        if (!this.isResizing) return;

        this.isResizing = false;
        this.resizingColIndex = -1;

        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        this.api.editor.saveHistory();
    };

    /**
     * 특정 열의 너비를 업데이트합니다.
     */
    private _updateColumnWidth(colIndex: number, width: number): void {
        if (!this.tableEl) return;

        const col = this.tableEl.querySelector(`colgroup col:nth-child(${colIndex + 1})`);
        if (col instanceof HTMLElement) {
            col.style.width = `${width}px`;
        }
    }

    /**
     * 행을 추가합니다.
     */
    public addRow(index?: number): void {
        const colCount = this.rows[0]?.length || 2;
        const newRow: TableCellData[] = Array(colCount).fill(null).map(() => ({ html: "" }));

        const insertIndex = index !== undefined ? index : this.rows.length;
        this.rows.splice(insertIndex, 0, newRow);

        this._refreshTable();
        this.api.editor.saveHistory();
    }

    /**
     * 열을 추가합니다.
     */
    public addColumn(index?: number): void {
        const insertIndex = index !== undefined ? index : (this.rows[0]?.length || 0);

        this.rows.forEach(row => {
            row.splice(insertIndex, 0, { html: "" });
        });

        this.colWidths.splice(insertIndex, 0, 120);

        this._refreshTable();
        this.api.editor.saveHistory();
    }

    /**
     * 행을 삭제합니다.
     */
    public deleteRow(index?: number): void {
        if (this.rows.length <= 1) return; // 최소 1행 유지

        const deleteIndex = index !== undefined ? index : this.rows.length - 1;
        this.rows.splice(deleteIndex, 1);

        this._refreshTable();
        this.api.editor.saveHistory();
    }

    /**
     * 열을 삭제합니다.
     */
    public deleteColumn(index?: number): void {
        if ((this.rows[0]?.length || 0) <= 1) return; // 최소 1열 유지

        const deleteIndex = index !== undefined ? index : (this.rows[0]?.length || 1) - 1;

        this.rows.forEach(row => {
            row.splice(deleteIndex, 1);
        });

        this.colWidths.splice(deleteIndex, 1);

        this._refreshTable();
        this.api.editor.saveHistory();
    }

    /**
     * 테이블을 다시 렌더링합니다.
     */
    private _refreshTable(): void {
        if (!this.el) return;

        const parent = this.el.parentNode;
        const nextSibling = this.el.nextSibling;

        this._unbindEvents();
        this.el.remove();

        this._render();
        this._bindEvents();

        if (parent && this.el) {
            // 새로 생성된 요소에 block ID 재설정
            setBlockId(this.el, this.id);

            if (nextSibling) {
                parent.insertBefore(this.el, nextSibling);
            } else {
                parent.appendChild(this.el);
            }
        }
    }

    /**
     * 블록이 비어있는지 확인합니다.
     */
    override isEmpty(): boolean {
        return this.rows.every(row =>
            row.every(cell => !cell.html || cell.html === "<br>")
        );
    }

    /**
     * 블록에 포커스를 설정합니다.
     */
    override focus(event?: Event): void {
        if (!this.el) return;

        // 클릭 이벤트가 있고, 클릭된 요소가 테이블 셀인 경우
        // 해당 셀에 포커스를 유지 (자동으로 포커스 이동하지 않음)
        if (event instanceof MouseEvent) {
            const target = event.target as HTMLElement;
            const clickedCell = target.closest(".table-cell-content");

            // 셀이 클릭된 경우, 이미 해당 셀에 포커스가 가 있으므로 추가 작업 불필요
            if (clickedCell instanceof HTMLElement && this.el.contains(clickedCell)) {
                return;
            }
        }

        // 그 외의 경우 (프로그래밍 방식의 포커스 등) 첫 번째 셀로 포커스
        const firstCell = this.el.querySelector(".table-cell-content");
        if (firstCell instanceof HTMLElement) {
            firstCell.focus();

            // 캐럿을 셀 시작 위치로
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(firstCell);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }

    /**
     * 테이블 블록을 JSON으로 직렬화합니다.
     */
    toJSON(): TableBlockData {
        // DOM에서 최신 데이터 추출
        if (this.el) {
            const cells = this.el.querySelectorAll(".table-cell-content");
            cells.forEach(cell => {
                const td = cell.closest("td");
                if (!td) return;

                const rowIndex = parseInt(td.dataset["row"] || "0", 10);
                const colIndex = parseInt(td.dataset["col"] || "0", 10);

                if (this.rows[rowIndex] && this.rows[rowIndex][colIndex]) {
                    this.rows[rowIndex][colIndex].html = (cell as HTMLElement).innerHTML;
                }
            });
        }

        return {
            id: this.id,
            type: "table",
            rows: this.rows,
            colWidths: this.colWidths,
            depth: this.depth
        };
    }
}
