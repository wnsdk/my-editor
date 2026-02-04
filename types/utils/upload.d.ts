export interface UploadResponse {
    url: string;
}
/**
 * 파일을 지정된 URL로 업로드합니다.
 * @param file - 업로드할 파일 객체.
 * @param url - 파일을 업로드할 대상 URL.
 * @returns 업로드 성공 시 서버 응답 (JSON 형식, 예: { url: "https://..." }).
 * @throws 업로드 실패 시 에러를 발생시킵니다.
 */
export declare function uploadFile(file: File, url: string): Promise<UploadResponse>;
