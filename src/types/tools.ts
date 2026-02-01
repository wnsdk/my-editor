// tool.ts
import BaseBlock from "../blocks/BaseBlock";

export type ToolType = 'text' | 'image' | 'video' | 'list' | 'table'

/**
 * 공통 Tool 설정
 */
export interface ToolConfig<TConfig = unknown> {
    toolbar?: boolean
    maxCount?: number
    onMaxCountReached?: (max: number) => void
    onCountChange?: (currentCount: number, maxCount?: number) => void
    config?: TConfig
}

export interface TextToolConfig {
    placeholder?: string
}

export interface ImageToolConfig {
    showDeleteButton: boolean
    uploader: UploaderConfig
    maxWidth?: number,
}

export interface VideoToolConfig {
    showDeleteButton: boolean;
    uploader: UploaderConfig;
    autoplay?: boolean;
}




export interface TableToolConfig {
    showDeleteButton: boolean;
    defaultRows: number;
    defaultCols: number;
    minCellWidth: number;
}

export interface ToolConfigMap {
    text: TextToolConfig
    image: ImageToolConfig
    video: VideoToolConfig
    list: Record<string, never>
    table: TableToolConfig
}

export type TypedToolConfig<T extends ToolType> = ToolConfig<ToolConfigMap[T]>

/**
 * 업로더 설정
 */
export interface UploaderConfig {
    fileSelectButton: string;
    openFilePicker?: () => void | Promise<void>;
    uploadByFile?: (file: File) => Promise<UploadResponse>;
}

/**
 * 업로드 응답 타입
 */
export type UploadResponse =
    | string  // URL 문자열
    | {       // 객체 형태
    success?: number;
    url?: string;
    file?: { url: string };
};