import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
import { ToolConfig } from "../../types";
export default class ListBlockPlugin extends Plugin {
    constructor(editor: Editor);
    initialize(): void;
    private handleKeyDown;
    static getToolSettings(): Record<"list", ToolConfig>;
}
