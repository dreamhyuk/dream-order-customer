import apiClient from "./apiClient";

export interface MenuDetailResponse {
  menuId: number;
  menuName: string;
  price: number;
  menuGroupId: number;
  menuGroupName: string;
}

/**
 * 특정 메뉴의 상세 정보 및 옵션 조회 API
 * 백엔드 경로: GET /api/customers/shops/{shopId}/menus/{menuId}
 */
export const getMenuDetail = async (
  shopId: number,
  menuId: number,
): Promise<MenuDetailResponse> => {
  console.log(`🚀 메뉴 상세 요청 - shopId: ${shopId}, menuId: ${menuId}`);

  const response = await apiClient.get<MenuDetailResponse>(
    `/api/customers/shops/${shopId}/menus/${menuId}`,
  );
  return response.data;
};
