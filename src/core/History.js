/**
 * 편집 내용의 실행 취소(Undo)와 다시 실행(Redo)을 위한 상태 스택을 관리하는 클래스입니다.
 */
export default class History {
    /**
     * History의 새 인스턴스를 생성합니다.
     * @param {number} [limit=100] - 히스토리 스택에 저장할 최대 상태 개수.
     */
    constructor(limit = 100) {
        /**
         * 에디터 상태를 저장하는 스택입니다. 각 상태는 JSON 문자열로 직렬화되어 저장됩니다.
         * @private
         * @type {string[]}
         */
        this.historyStack = [];
        /**
         * 현재 상태 스택의 인덱스입니다.
         * @private
         * @type {number}
         */
        this.currentIndex = -1;
        /**
         * 히스토리 스택의 최대 크기입니다.
         * @private
         * @type {number}
         */
        this.limit = limit;
    }

    /**
     * 현재 에디터 상태를 히스토리 스택에 추가합니다.
     * 새로운 상태가 추가되면 현재 인덱스 이후의 모든 상태는 버려집니다.
     * @param {object} state - 저장할 에디터 상태 객체.
     */
    push(state) {
        // 현재 인덱스 이후의 상태를 모두 버립니다 (새로운 작업이 시작되었으므로 Redo 불가능)
        this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);

        // 상태를 JSON 문자열로 직렬화하여 저장 (깊은 복사를 통해 상태 변경 방지)
        this.historyStack.push(JSON.stringify(state));

        // 스택 크기 제한 적용
        if (this.historyStack.length > this.limit) {
            this.historyStack.shift(); // 가장 오래된 상태 제거
            // shift()를 사용하면 인덱스가 자동으로 조정되므로 currentIndex는 그대로 유지
        } else {
            this.currentIndex++;
        }
    }

    /**
     * 실행 취소(Undo)가 가능한지 여부를 확인합니다.
     * @returns {boolean} 실행 취소가 가능하면 true, 그렇지 않으면 false.
     */
    canUndo() {
        // 첫 번째 상태(초기 상태) 이전으로는 실행 취소할 수 없습니다.
        return this.currentIndex > 0;
    }

    /**
     * 다시 실행(Redo)이 가능한지 여부를 확인합니다.
     * @returns {boolean} 다시 실행이 가능하면 true, 그렇지 않으면 false.
     */
    canRedo() {
        return this.currentIndex < this.historyStack.length - 1;
    }

    /**
     * 이전 상태로 되돌립니다 (Undo).
     * @returns {object|null} 이전 에디터 상태 객체 또는 실행 취소가 불가능한 경우 null.
     */
    undo() {
        if (!this.canUndo()) {
            return null;
        }
        this.currentIndex--;
        return JSON.parse(this.historyStack[this.currentIndex]);
    }

    /**
     * 다음 상태로 다시 실행합니다 (Redo).
     * @returns {object|null} 다음 에디터 상태 객체 또는 다시 실행이 불가능한 경우 null.
     */
    redo() {
        if (!this.canRedo()) {
            return null;
        }
        this.currentIndex++;
        return JSON.parse(this.historyStack[this.currentIndex]);
    }
}
