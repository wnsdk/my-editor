import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
/**
 * 에디터의 플레이스홀더 기능을 제공하는 플러그인
 * - 에디터가 비어 있을 때 안내 문구 표시
 */
export default class PlaceholderPlugin extends Plugin {
    private text;
    private el;
    private mutationObserver;
    private updateVisibilityBound;
    constructor(editor: Editor);
    initialize(): void;
    private createPlaceholderElement;
    private observeEditorChanges;
    private updatePlaceholderVisibility;
    private positionPlaceholder;
    destroy(): void;
}
