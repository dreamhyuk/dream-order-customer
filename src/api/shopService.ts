import apiClient from "./apiClient";

// 백엔드 ShopSearchRequestDto와 1:1로 매핑되는 요청 파라미터 interface 정의
export interface ShopSearchRequestParams {
  keyword?: string;
  categoryId?: number;
}

// 백엔드 ShopSearchResponseDto 구조에 맞게 정의
export interface ShopSearchResponse {
  id: string;
  name: string;
  categoryNames: string[];
  // 주소, 최소주문금액, 배달팁 등 백엔드에서 주는 필드들을 추가하세요.
  // imageUrl?: string;
}

/**
 * 실제 앱 스타일 가게 검색 API 호출 함수
 * @param keyword 유저가 검색창에 입력한 텍스트 (우선순위 1순위)
 * @param categoryId 유저가 홈화면 등에서 선택한 카테고리 ID (우선순위 2순위)
 */
export const searchShops = async (
  keyword: string,
  categoryId: number | null,
): Promise<ShopSearchResponse[]> => {
  // 백엔드로 보낼 쿼리 스트링 파라미터 객체 생성
  const params: ShopSearchRequestParams = {};

  // ⭐ [핵심 설계 구현]
  // 1순위: 현재 검색창 입력값(keyword)이 한 글자라도 존재하면 카테고리는 무조건 무시하고 keyword만 전송
  if (keyword.trim() !== "") {
    params.keyword = keyword;
  }
  // 2순위: 검색창이 비어있고, 카테고리를 선택해서 들어왔다면 categoryId만 전송
  else if (categoryId !== null) {
    params.categoryId = categoryId;
  }

  console.log("🚀 백엔드 DTO로 전송되는 최종 파라미터:", params);

  // @ModelAttribute 형식이므로 params 객체를 넘기면 알아서 ?keyword=xxx 또는 ?categoryId=xxx 로 빌드됩니다.
  const response = await apiClient.get<ShopSearchResponse[]>(
    "/api/customers/shops",
    { params }, // 💡 축약형으로 params: params 와 같습니다.
  );
  return response.data;
};

export interface Address {
  city: string;
  street: string;
  zipcode: string;
}

export interface ShopDetailResponse {
  shopName: string;
  address: Address;
  averageRating: number;
  reviewCount: number;
}

//메뉴 단건 정보
export interface MenuSummaryResponse {
  id: number;
  menuName: string;
  price: number;
}

//백엔드 MenuGroupResponseDto 매핑 (계층형 구조)
export interface MenuGroupResponse {
  menuGroupId: number;
  name: string;
  priority: number;
  menus: MenuSummaryResponse[];
}

/**
 * 1. 가게 상세 기본 정보 조회 API
 * @param shopId 가게 고유 ID
 * 백엔드 경로: GET /api/customers/shops/{shopId}
 */
export const getShopDetail = async (
  shopId: number,
): Promise<ShopDetailResponse> => {
  console.log(`🚀 가게 상세 정보 요청 - shopId: ${shopId}`);

  const response = await apiClient.get<ShopDetailResponse>(
    `/api/customers/shops/${shopId}`,
  );
  return response.data;
};

/**
 * 2. 특정 가게의 전체 메뉴 그룹 및 메뉴 목록 조회 API
 * @param shopId 가게 고유 ID
 * 백엔드 경로: GET /api/customers/shops/{shopId}/menus
 */
export const getShopMenus = async (
  shopId: number,
): Promise<MenuGroupResponse[]> => {
  console.log(`🚀 가게 메뉴 목록 요청 - shopId: ${shopId}`);

  const response = await apiClient.get<MenuGroupResponse[]>(
    `/api/customers/shops/${shopId}/menus`,
  );
  return response.data;
};
