// ui/BlockMenu.ts

/**
 * 블록 메뉴의 CSS 클래스 이름입니다.
 */
const BLOCK_MENU_CLASS = "block-menu";

/**
 * 블록 이동 버튼의 데이터 속성 이름입니다.
 */
const BLOCK_MOVE_DATA_ATTRIBUTES = {
    UP: "up",
    DOWN: "down"
} as const;

/**
 * 주어진 블록 요소에 블록 메뉴(위/아래 이동 버튼)를 추가합니다.
 * @param blockEl - 메뉴를 추가할 대상 블록 DOM 요소.
 */
export function attachBlockMenu(blockEl: HTMLElement): void {
    const menu = document.createElement("div");
    menu.className = BLOCK_MENU_CLASS;
    menu.innerHTML = `
        <button data-block-move="${BLOCK_MOVE_DATA_ATTRIBUTES.UP}">↑</button>
        <button data-block-move="${BLOCK_MOVE_DATA_ATTRIBUTES.DOWN}">↓</button>
    `;
    blockEl.appendChild(menu);
}
