import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "user_access_token";

export const authStorage = {
  // 💡 1. 토큰 저장하기
  setToken: async (token: string) => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("토큰 저장 실패:", error);
    }
  },

  // 💡 2. 토큰 꺼내오기
  getToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error("토큰 조회 실패:", error);
      return null;
    }
  },

  // 💡 3. 토큰 지우기 (로그아웃용)
  removeToken: async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error("토큰 삭제 실패:", error);
    }
  },
};
