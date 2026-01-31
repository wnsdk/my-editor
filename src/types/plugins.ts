import type { BaseBlockData } from './blocks.ts';
import type {ToolConfig, UploaderConfig} from "./tools";

/**
 * 플러그인의 기본 인터페이스
 */
export interface PluginInterface {
    initialize(): void;
}

/**
 * 플러그인 클래스의 생성자 타입
 */
export interface PluginConstructor {
    new (editor: any): PluginInterface;
    getToolSettings?(): Record<string, ToolConfig>;
}



/**
 * 이벤트 핸들러 타입들
 */
export interface EventHandlers {
    onKeyDown?: (event: KeyboardEvent) => void;
    onKeyUp?: (event: KeyboardEvent) => void;
    onClick?: (event: MouseEvent) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}

/**
 * 플러그인 옵션
 */
export interface PluginOptions {
    enabled?: boolean;
    config?: Record<string, any>;
}

/**
 * 도구 설정의 전체 컬렉션 타입
 */
export type ToolSettings = Record<string, ToolConfig>;