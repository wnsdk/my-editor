// utils/throttle.js

/**
 * 함수 호출을 제한하여 지정된 시간(wait) 내에 한 번만 실행되도록 합니다.
 * 마지막 호출 이후 wait 시간 내에 다시 호출되면, 이전 호출은 무시되고 새로운 호출은 wait 시간 후에 실행됩니다.
 *
 * @param {Function} func - 스로틀링할 함수.
 * @param {number} [wait=100] - 함수가 다시 호출될 수 있기까지 기다릴 시간(밀리초).
 * @returns {Function} 스로틀링된 함수.
 */
export function throttle(func, wait = 100) {
    let lastExecutionTime = 0;
    let timeoutId = null;

    return function (...args) {
        const context = this;
        const now = Date.now();

        // 마지막 실행 시간으로부터 wait 시간 이상 지났으면 즉시 실행
        if (now - lastExecutionTime >= wait) {
            lastExecutionTime = now;
            func.apply(context, args);
        } else {
            // 아직 wait 시간 내라면 이전 타이머를 취소하고 새로운 타이머 설정
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastExecutionTime = Date.now();
                func.apply(context, args);
            }, wait - (now - lastExecutionTime));
        }
    };
}
