/**
 * 편집 내용의 실행 취소(Undo)와 다시 실행(Redo)을 위한 상태 스택을 관리하는 클래스입니다.
 */

export interface HistoryState {
    canUndo: boolean;
    canRedo: boolean;
    stackSize: number;
    currentIndex: number;
}

export default class History {
    /**
     * 에디터 상태를 저장하는 스택입니다. 각 상태는 JSON 문자열로 직렬화되어 저장됩니다.
     */
    private historyStack: string[];

    /**
     * 현재 상태 스택의 인덱스입니다.
     */
    private currentIndex: number;

    /**
     * 히스토리 스택의 최대 크기입니다.
     */
    private limit: number;

    /**
     * History의 새 인스턴스를 생성합니다.
     * @param limit - 히스토리 스택에 저장할 최대 상태 개수.
     */
    constructor(limit: number = 100) {
        this.historyStack = [];
        this.currentIndex = -1;
        this.limit = limit;
    }

    /**
     * 현재 에디터 상태를 히스토리 스택에 추가합니다.
     * 새로운 상태가 추가되면 현재 인덱스 이후의 모든 상태는 버려집니다.
     * @param state - 저장할 에디터 상태 객체.
     */
    push(state: unknown): void {
        // 상태를 JSON 문자열로 직렬화 (깊은 복사를 통해 상태 변경 방지)
        const serializedState = JSON.stringify(state);

        // 중복 상태 저장 방지: 현재 상태와 동일하면 저장하지 않음
        if (this.currentIndex >= 0 && this.historyStack[this.currentIndex] === serializedState) {
            return;
        }

        // 현재 인덱스 이후의 상태를 모두 버립니다 (새로운 작업이 시작되었으므로 Redo 불가능)
        this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);

        // 새로운 상태 추가
        this.historyStack.push(serializedState);
        this.currentIndex++;

        // 스택 크기 제한 적용
        if (this.historyStack.length > this.limit) {
            this.historyStack.shift(); // 가장 오래된 상태 제거
            this.currentIndex--; // shift()로 인해 인덱스도 함께 조정
        }
    }

    /**
     * 실행 취소(Undo)가 가능한지 여부를 확인합니다.
     * @returns 실행 취소가 가능하면 true, 그렇지 않으면 false.
     */
    canUndo(): boolean {
        // 첫 번째 상태(초기 상태) 이전으로는 실행 취소할 수 없습니다.
        return this.currentIndex > 0;
    }

    /**
     * 다시 실행(Redo)이 가능한지 여부를 확인합니다.
     * @returns 다시 실행이 가능하면 true, 그렇지 않으면 false.
     */
    canRedo(): boolean {
        return this.currentIndex < this.historyStack.length - 1;
    }

    /**
     * 이전 상태로 되돌립니다 (Undo).
     * @returns 이전 에디터 상태 객체 또는 실행 취소가 불가능한 경우 null.
     */
    undo(): unknown | null {
        if (!this.canUndo()) {
            return null;
        }
        this.currentIndex--;
        return JSON.parse(this.historyStack[this.currentIndex]);
    }

    /**
     * 다음 상태로 다시 실행합니다 (Redo).
     * @returns 다음 에디터 상태 객체 또는 다시 실행이 불가능한 경우 null.
     */
    redo(): unknown | null {
        if (!this.canRedo()) {
            return null;
        }
        this.currentIndex++;
        return JSON.parse(this.historyStack[this.currentIndex]);
    }

    /**
     * 히스토리 스택을 초기화합니다.
     */
    clear(): void {
        this.historyStack = [];
        this.currentIndex = -1;
    }

    /**
     * 현재 히스토리 상태 정보를 반환합니다.
     */
    getState(): HistoryState {
        return {
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            stackSize: this.historyStack.length,
            currentIndex: this.currentIndex
        };
    }
}
