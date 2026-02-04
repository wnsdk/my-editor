/**
 * 함수 호출을 제한하여 지정된 시간(wait) 내에 한 번만 실행되도록 합니다.
 * 마지막 호출 이후 wait 시간 내에 다시 호출되면, 이전 호출은 무시되고 새로운 호출은 wait 시간 후에 실행됩니다.
 *
 * @param func - 스로틀링할 함수.
 * @param wait - 함수가 다시 호출될 수 있기까지 기다릴 시간(밀리초).
 * @returns 스로틀링된 함수.
 */
export declare function throttle<T extends (...args: unknown[]) => void>(func: T, wait?: number): (...args: Parameters<T>) => void;
