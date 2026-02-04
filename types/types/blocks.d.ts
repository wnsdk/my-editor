import { ToolType } from "./tools";
import Editor from "../core/Editor";
import BaseBlock from "../blocks/BaseBlock";
export type BlockData = TextBlockData | ListBlockData | ImageBlockData | VideoBlockData | TableBlockData;
export type BaseBlockData = {
    id?: string;
    type: ToolType;
    depth?: number;
};
export type TextBlockData = BaseBlockData & {
    type: 'text';
    html: string;
};
export type ListBlockData = BaseBlockData & {
    type: 'list';
    style: 'ordered' | 'unordered';
    html: string;
};
export type ImageBlockData = BaseBlockData & {
    type: 'image';
    src: string;
    alt?: string;
    width?: number | string | null;
    height?: number | string | null;
    align?: 'left' | 'center' | 'right';
};
export type VideoBlockData = BaseBlockData & {
    type: 'video';
    src: string;
    posterUrl?: string | undefined;
};
export type TableCellData = {
    html: string;
};
export type TableBlockData = BaseBlockData & {
    type: 'table';
    rows: TableCellData[][];
    colWidths?: number[];
};
export interface BlockAPI {
    removeBlock: (block: BaseBlock) => void;
    editor: Editor;
}
export interface BlockInit<TConfig = unknown> {
    config: Partial<TConfig>;
    api: BlockAPI;
}
export type BlockConstructor<TConfig = any> = new (data: any, init: BlockInit<TConfig>) => BaseBlock;
