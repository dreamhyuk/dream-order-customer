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
} from "react-native"; // 💡 임포트 추가
// import { login } from "../../src/api/authService";
import { login } from "../../src/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 💡 중복 클릭 방지용 상태 추가

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
        role: "CUSTOMER", // 앱을 분리하기로 했기 때문에 상수로 고정
      });

      // 💡 웹 환경과 모바일 환경을 분기하여 저장합니다.
      if (Platform.OS === "web") {
        localStorage.setItem("userToken", result.accessToken);
      } else {
        await SecureStore.setItemAsync("userToken", result.accessToken);
      }

      // 성공 시 AccessToken 처리 (보통 SecureStore 등에 저장)
      console.log("Access Token:", result.accessToken);
      Alert.alert("성공", "로그인 되었습니다.");
      router.replace("/");
    } catch (error: any) {
      console.error(error);
      Alert.alert("오류", "로그인 정보가 올바르지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyOrderApp 로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address" // 💡 이메일 입력용 키보드로 최적화 (@ 표기)
        returnKeyType="next" // 💡 엔터 치면 다음 칸으로 넘어가도록 암시
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onSubmitEditing={handleLogin} // 💡 비밀번호 치고 엔터 누르면 로그인 실행!
        returnKeyType="done" // 💡 키보드 엔터 키를 '완료' 모양으로 변경
      />

      {/* 접속 유형 가이드 */}
      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>접속 유형: 일반 고객</Text>
      </View>

      {/* 💡 기본 Button을 버리고 배민 스타일의 커스텀 민트색 버튼으로 변경 */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff", // 배경을 흰색으로 깔끔하게 지정
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
  // 커스텀 로그인 버튼 스타일
  loginButton: {
    backgroundColor: "#2AC1BC", // 브랜드 민트색 컬러 매칭
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#a5e5e2", // 로딩 중일 때 살짝 연하게 처리
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 커스텀 회원가입 버튼 스타일
  signupButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    color: "#888",
    fontSize: 14,
    textDecorationLine: "underline", // 회원가입 유도 링크 느낌 부여
  },
});
