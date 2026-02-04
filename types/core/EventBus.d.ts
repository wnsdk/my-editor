/**
 * 에디터 내부 컴포넌트 간의 이벤트를 중개하는 이벤트 버스 클래스입니다.
 * 발행-구독(Publish-Subscribe) 패턴을 구현합니다.
 * 키 입력, 클릭, 블록 이동 등과 같은 이벤트를 전달합니다.
 */
export type EventHandler<T = unknown> = (payload: T) => void;
export default class EventBus {
    /**
     * 각 이벤트 이름에 대한 핸들러 함수 배열을 저장하는 객체입니다.
     */
    private eventHandlers;
    /**
     * EventBus의 새 인스턴스를 생성합니다.
     */
    constructor();
    /**
     * 특정 이벤트에 대한 핸들러 함수를 등록합니다.
     * @param eventName - 구독할 이벤트의 이름.
     * @param handler - 이벤트 발생 시 호출될 함수.
     * @returns 구독 해제를 위한 함수
     */
    on<T = unknown>(eventName: string, handler: EventHandler<T>): () => void;
    /**
     * 특정 이벤트에 대해 한 번만 실행되는 핸들러 함수를 등록합니다.
     * 이벤트 발생 후 자동으로 구독이 해제됩니다.
     * @param eventName - 구독할 이벤트의 이름.
     * @param handler - 이벤트 발생 시 호출될 함수.
     * @returns 구독 해제를 위한 함수
     */
    once<T = unknown>(eventName: string, handler: EventHandler<T>): () => void;
    /**
     * 특정 이벤트에 등록된 핸들러 함수를 제거합니다.
     * @param eventName - 구독 해지할 이벤트의 이름.
     * @param handler - 제거할 핸들러 함수.
     */
    off<T = unknown>(eventName: string, handler: EventHandler<T>): void;
    /**
     * 특정 이벤트를 발생시키고, 해당 이벤트에 등록된 모든 핸들러 함수를 호출합니다.
     * @param eventName - 발생시킬 이벤트의 이름.
     * @param payload - 이벤트 핸들러에 전달할 데이터.
     */
    emit<T = unknown>(eventName: string, payload?: T): void;
    /**
     * 특정 이벤트에 등록된 모든 핸들러를 제거합니다.
     * @param eventName - 핸들러를 제거할 이벤트의 이름.
     */
    offAll(eventName?: string): void;
    /**
     * 모든 이벤트의 모든 핸들러를 제거합니다.
     * 에디터 인스턴스 정리 시 메모리 누수를 방지하기 위해 호출합니다.
     */
    clear(): void;
    /**
     * 특정 이벤트에 등록된 핸들러 수를 반환합니다.
     * @param eventName - 확인할 이벤트의 이름.
     * @returns 등록된 핸들러 수
     */
    listenerCount(eventName: string): number;
    /**
     * 등록된 모든 이벤트 이름을 반환합니다.
     * @returns 이벤트 이름 배열
     */
    eventNames(): string[];
}
