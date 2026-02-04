import Editor from "./Editor";
import { ToolConfig } from "../types";
/**
 * 에디터 플러그인을 위한 기본 클래스입니다.
 * 모든 에디터 플러그인은 이 클래스를 상속받아 에디터의 기능을 확장해야 합니다.
 */
export default abstract class Plugin {
    protected editor: Editor;
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 에디터에 기능을 등록합니다.
     */
    abstract initialize(): void;
    /**
     * 이 플러그인이 제공하는 toolSettings를 반환하는 정적 메서드입니다.
     * 블록 플러그인과 같이 에디터의 toolSettings에 기여하는 플러그인에서 구현됩니다.
     */
    static getToolSettings(): Record<string, ToolConfig>;
}
