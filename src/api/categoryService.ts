import apiClient from "./apiClient";

// 백엔드의 CategoryResponseDto 구조와 매칭되도록 정의하세요.
export interface CategoryResponse {
  id: number; // 혹은 string (백엔드 Entity Id 타입에 맞게)
  categoryName: string;
  priority: number | null; // 💡 null 값이 올 수 있음을 명시
  // 만약 백엔드에서 아이콘 이름이나 이미지 URL도 준다면 여기에 추가
  //   iconName?: string;
}

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const response = await apiClient.get<CategoryResponse[]>("/api/categories");
  return response.data;
};
