import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // 모바일용 스토리지 임포트
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  // 기본값을 false로 두고, 로딩 상태를 따로 관리하는 것이 가장 안전합니다.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token =
          Platform.OS === "web"
            ? localStorage.getItem("userToken")
            : await SecureStore.getItemAsync("userToken");

        if (!token) {
          // 토큰이 없으면 즉시 로그인 창으로 이동
          router.replace("../auth/login");
        } else {
          // 토큰이 있을 때만 로그인 상태를 true로
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
        router.replace("../auth/login");
      } finally {
        setIsLoading(false); // 검증 끝났으므로 로딩 종료
      }
    };

    checkLogin();
  }, []);

  // 💡 로딩 중일 때는 화면에 아무것도 그리지 않거나 로딩 인디케이터를 보여줍니다.
  if (isLoading) return null;

  // 💡 로그인 성공 상태가 아니라면 마이페이지 문구를 절대로 보여주지 않습니다.
  if (!isLoggedIn) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>내 정보 (마이페이지) 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: { fontSize: 18, fontWeight: "bold" },
});
