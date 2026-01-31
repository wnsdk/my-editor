// utils/upload.js

/**
 * 파일을 지정된 URL로 업로드합니다.
 * @param {File} file - 업로드할 파일 객체.
 * @param {string} url - 파일을 업로드할 대상 URL.
 * @returns {Promise<object>} 업로드 성공 시 서버 응답 (JSON 형식, 예: { url: "https://..." }).
 * @throws {Error} 업로드 실패 시 에러를 발생시킵니다.
 */
export async function uploadFile(file, url) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            const errorText = await res.text(); // 서버에서 보낸 에러 메시지 확인
            throw new Error(`Upload failed with status ${res.status}: ${errorText}`);
        }

        return res.json(); // { url: "https://..." } 형식 가정
    } catch (error) {
        console.error("Error during file upload:", error);
        throw new Error(`File upload failed: ${error.message}`);
    }
}
