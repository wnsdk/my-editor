/**
 * 에디터 내부 컴포넌트 간의 이벤트를 중개하는 이벤트 버스 클래스입니다.
 * 발행-구독(Publish-Subscribe) 패턴을 구현합니다.
 * 키 입력, 클릭, 블록 이동 등과 같은 이벤트를 전달합니다.
 */
export default class EventBus {
    /**
     * EventBus의 새 인스턴스를 생성합니다.
     */
    constructor() {
        /**
         * 각 이벤트 이름에 대한 핸들러 함수 배열을 저장하는 객체입니다.
         * @private
         * @type {Object.<string, Function[]>}
         */
        this.eventHandlers = {};
    }

    /**
     * 특정 이벤트에 대한 핸들러 함수를 등록합니다.
     * @param {string} eventName - 구독할 이벤트의 이름.
     * @param {Function} handler - 이벤트 발생 시 호출될 함수.
     */
    on(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }

    /**
     * 특정 이벤트에 등록된 핸들러 함수를 제거합니다.
     * @param {string} eventName - 구독 해지할 이벤트의 이름.
     * @param {Function} handler - 제거할 핸들러 함수.
     */
    off(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            return;
        }
        this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(h => h !== handler);
    }

    /**
     * 특정 이벤트를 발생시키고, 해당 이벤트에 등록된 모든 핸들러 함수를 호출합니다.
     * @param {string} eventName - 발생시킬 이벤트의 이름.
     * @param {*} [payload] - 이벤트 핸들러에 전달할 데이터.
     */
    emit(eventName, payload) {
        if (!this.eventHandlers[eventName]) {
            return;
        }
        // 핸들러가 비동기적으로 동작할 수도 있으므로, 복사본을 순회하는 것이 안전합니다.
        [...this.eventHandlers[eventName]].forEach(handler => {
            try {
                handler(payload);
            } catch (error) {
                console.error(`Error in event handler for "${eventName}":`, error);
            }
        });
    }
}
