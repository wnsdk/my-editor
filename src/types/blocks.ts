import {ToolType} from "./tools";
import Editor from "../core/Editor";
import BaseBlock from "../blocks/BaseBlock";

export type BlockData =
    | TextBlockData
    | ListBlockData
    | ImageBlockData
    | VideoBlockData;

export type BaseBlockData = {
    id?: string;
    type: ToolType;
    depth?: number;  // 블록의 들여쓰기 레벨 (기본값: 0)
}

export type TextBlockData = BaseBlockData & {
    type: 'text';
    html: string;
}

export type ListBlockData = BaseBlockData & {
    type: 'list';
    style: 'ordered' | 'unordered';
    html: string;  // items 배열 대신 단일 html 필드 사용
}

export type ImageBlockData = BaseBlockData & {
    type: 'image';
    src: string;
    alt?: string;
    width?: number | string | null;
    height?: number | string | null;
    align?: 'left' | 'center' | 'right';
}

export type VideoBlockData = BaseBlockData & {
    type: 'video';
    src: string;
    posterUrl?: string | undefined;
}


export interface BlockAPI {
    removeBlock: (block: BaseBlock) => void;
    editor: Editor;
}

export interface BlockInit<TConfig = unknown> {
    config: Partial<TConfig>;
    api: BlockAPI;
}

export type BlockConstructor<TConfig = any> =
    new (data: any, init: BlockInit<TConfig>) => BaseBlock;
