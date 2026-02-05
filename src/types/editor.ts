import type { BaseBlockData } from './blocks.ts';
import {ToolConfig} from "./tools";
import BaseBlock from "../blocks/BaseBlock";

/**
 * 에디터 초기화 옵션
 */
export interface EditorOptions {
    holder: string | HTMLElement;
    toolbar?: boolean;
    placeholder?: string;
    tools?: Record<string, ToolConfig>;
    plugins?: Array<new (editor: any) => any>;
    onChange?: (blocks: BaseBlockData[]) => void;
    readOnly?: boolean;
    data?: BaseBlockData[];
}
