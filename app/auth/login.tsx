import { Ionicons } from "@expo/vector-icons"; // 💡 아이콘 임포트 추가
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { login } from "../../src/api/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login({
        email,
        password,
        role: "CUSTOMER",
      });

      if (Platform.OS === "web") {
        localStorage.setItem("userToken", result.accessToken);
      } else {
        await SecureStore.setItemAsync("userToken", result.accessToken);
      }

      console.log("Access Token:", result.accessToken);
      Alert.alert("성공", "로그인 되었습니다.");
      router.replace("/"); // 로그인 성공 시 메인(홈)으로 이동
    } catch (error: any) {
      console.error(error);
      Alert.alert("오류", "로그인 정보가 올바르지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 💡 상단 헤더 영역 추가: 홈으로 돌아가는 닫기 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 내부 콘텐츠를 감싸는 영역 (헤더 공간 확보) */}
      <View style={styles.content}>
        <Text style={styles.title}>MyOrderApp 로그인</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={handleLogin}
          returnKeyType="done"
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>접속 유형: 일반 고객</Text>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isSubmitting && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Text style={styles.loginButtonText}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/auth/signup")}
        >
          <Text style={styles.signupButtonText}>회원가입 하러가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // 💡 상단 헤더 스타일
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // 우측 상단에 X 버튼 배치
    paddingHorizontal: 16,
    marginTop: Platform.OS === "ios" ? 40 : 10, // 노치 디자인 대응
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60, // 화면 중앙 밸런스 유지
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  roleContainer: {
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  roleText: {
    color: "#888",
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: "#2AC1BC",
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#a5e5e2",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    color: "#888",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
