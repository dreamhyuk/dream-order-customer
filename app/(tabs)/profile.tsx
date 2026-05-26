import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// 💡 authService.ts에 맞춰 정확한 명칭으로 임포트
import { fetchMyProfile, logout } from "../../src/api/authService";

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // 💡 백엔드 반환 타입과 맞춰 username 상태 관리
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const checkLoginAndFetchProfile = async () => {
      try {
        const token =
          Platform.OS === "web"
            ? localStorage.getItem("userToken")
            : await SecureStore.getItemAsync("userToken");

        if (!token) {
          // 토큰이 없으면 즉시 로그인 창으로 이동
          router.replace("/auth/login");
          return;
        }

        // 💡 토큰이 존재할 때, 백엔드 신규 API(/api/customers/me)로 프로필 조회
        const profile = await fetchMyProfile();
        setUsername(profile.username); // 'username' 세팅

        setIsLoggedIn(true);
      } catch (error) {
        console.error("인증 또는 프로필 조회 실패:", error);
        // 토큰이 유효하지 않거나 백엔드 조회 실패 시 세션 비우고 로그인창 이동
        await handleClearSession();
      } finally {
        setIsLoading(false); // 검증 끝났으므로 로딩 종료
      }
    };

    checkLoginAndFetchProfile();
  }, []);

  // 💡 로컬 저장소 세션 클리어 공통 로직
  const handleClearSession = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("userToken");
    } else {
      await SecureStore.deleteItemAsync("userToken");
    }
    router.replace("/auth/login");
  };

  // 💡 로그아웃 비즈니스 로직 실행
  const executeLogout = async () => {
    try {
      setIsLoggingOut(true);

      // 1. 백엔드 Redis 토큰 삭제 요청 (RT 제거)
      await logout();
      console.log("서버 로그아웃 성공");

      if (Platform.OS === "web") {
        alert("로그아웃 되었습니다.");
      } else {
        Alert.alert("알림", "로그아웃 되었습니다.");
      }

      // 2. 로컬 세션 지우고 로그인 화면으로 이동
      await handleClearSession();
    } catch (error: any) {
      console.error("로그아웃 실패:", error);

      // 백엔드 세션이 만료되어 INVALID_REFRESH_TOKEN 등이 뜨더라도,
      // 사용자가 앱에 갇히지 않도록 프론트 세션을 지우고 로그인으로 넘겨줍니다.
      if (error.response?.data?.code === "INVALID_REFRESH_TOKEN") {
        await handleClearSession();
      } else {
        const errorMessage =
          error.response?.data?.message || "로그아웃 중 오류가 발생했습니다.";
        if (Platform.OS === "web") {
          alert(errorMessage);
        } else {
          Alert.alert("오류", errorMessage);
        }
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 💡 로그아웃 버튼 클릭 시 한 번 더 물어보는 얼럿 팝업
  const handleLogoutPress = () => {
    if (Platform.OS === "web") {
      if (confirm("정말 로그아웃 하시겠습니까?")) executeLogout();
    } else {
      Alert.alert(
        "로그아웃",
        "정말 로그아웃 하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "확인", onPress: executeLogout, style: "destructive" },
        ],
        { cancelable: true },
      );
    }
  };

  // 로딩 중일 때는 화면에 아무것도 그리지 않음
  if (isLoading) return null;

  // 로그인 성공 상태가 아니라면 마이페이지 콘텐츠 보호
  if (!isLoggedIn) return null;

  return (
    <View style={styles.container}>
      {/* 💡 상단 프로필 영역 (유저네임 시각적 강조) */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          {/* 유저네임 첫 글자를 아바타 아이콘 대신 노출 */}
          <Text style={styles.avatarText}>
            {username ? username.substring(0, 1) : ""}
          </Text>
        </View>
        <Text style={styles.welcomeText}>
          <Text style={styles.username}>{username}</Text>님, 안녕하세요!
        </Text>
      </View>

      {/* 마이페이지 기본 메뉴 구성 목록 */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>주문 내역 확인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>내 정보 수정</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 로그아웃 버튼 */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogoutPress}
        disabled={isLoggingOut}
      >
        <Text style={styles.logoutButtonText}>
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 8,
    borderBottomColor: "#f5f5f5", // 배민 스타일의 굵고 깔끔한 회색 구분선
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2AC1BC", // 브랜드 시그니처 민트색 컬러 서클
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
  },
  username: {
    fontWeight: "bold",
    color: "#000",
  },
  menuContainer: {
    flex: 1,
    marginTop: 16,
  },
  menuItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#444",
  },
  logoutButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#999", // 너무 튀지 않도록 연한 회색 톤 처리
    fontSize: 14,
    fontWeight: "600",
  },
});
