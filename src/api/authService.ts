import apiClient from "./apiClient";

// 로그인 데이터 타입 정의
interface LoginRequest {
  email: string;
  password: string;
  role: "CUSTOMER";
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  grantType: string;
}

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  // 인스턴스를 사용하므로 주소 뒷부분만 적으면 됩니다.
  const response = await apiClient.post<TokenResponse>(
    "/api/customers/login",
    data,
  );
  return response.data;
};

// 나중에 회원가입이나 로그아웃이 추가되면 여기에 이어서 작성하면 됨
