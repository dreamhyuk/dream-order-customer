import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// 1. 카테고리 서비스와 타입 임포트
import { CategoryResponse, getCategories } from "../../src/api/categoryService";

// 화면 너비를 구해 4열 격자 크기를 계산합니다
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 4;

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 화면이 켜질 때 백엔드에서 카테고리 목록 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        // 1. 백엔드에서 이미 정렬된 데이터를 받아옵니다.
        const data = await getCategories();

        // 2. 추가적인 정렬(.sort()) 과정 없이 바로 셋팅합니다!
        setCategories(data);
      } catch (error) {
        console.error("카테고리 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 검색 버튼을 누르거나 엔터를 쳤을 때 실행될 함수
  const handleSearch = () => {
    if (!searchQuery.trim()) return; // 빈 검색어는 막기

    // 💡 검색 결과 화면으로 검색어를 품고 이동합니다!
    router.push({
      pathname: "/search-result",
      params: { keyword: searchQuery },
    });
  };

  // 홈 화면의 카테고리 클릭 함수
  const handleCategoryClick = (id: number, name: string) => {
    console.log(`${name} (ID: ${id}) 클릭됨`); // 👈 지금 이건 잘 찍히고 있음!

    // 💡 [추가] 반드시 이 라우터 이동 코드가 실행되어야 화면이 넘어갑니다!
    router.push({
      pathname: "/search-result",
      params: { categoryId: id.toString() }, // 쿼리 스트링으로 id 전달
    });
  };

  // 메인 화면 렌더링 (단 하나의 올바른 return)
  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* 상단 로고 및 검색 바 영역 */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>MyOrderApp</Text>
        </View>

        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="먹고 싶은 메뉴를 검색해보세요!"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch} // 💡 키보드에서 엔터(검색) 눌렀을 때 작동
            returnKeyType="search" // 💡 키보드 엔터 버튼을 '검색' 돋보기 모양으로 변경
          />
        </View>
      </View>

      {/* 카테고리 영역 */}
      <View style={styles.categoryContainer}>
        <Text style={styles.sectionTitle}>카테고리</Text>

        {isLoading ? (
          // 로딩 중일 때 보여줄 스피너
          <ActivityIndicator
            size="large"
            color="#2AC1BC"
            style={{ marginTop: 40 }}
          />
        ) : (
          // 로딩 완료 후 카테고리 격자(Grid) 표현
          <View style={styles.gridContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={
                  () => handleCategoryClick(category.id, category.categoryName) //라우팅 함수로 교체
                }
              >
                {/* 아이콘 이미지 대신 첫 글자를 띄우는 원형 컨테이너 */}
                <View style={styles.iconCircle}>
                  <Text style={styles.initialText}>
                    {category.categoryName
                      ? category.categoryName.charAt(0)
                      : "?"}
                  </Text>
                </View>
                {/* 전체 카테고리 이름 표시 */}
                <Text style={styles.categoryLabel}>
                  {category.categoryName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // 상단 영역 스타일
  headerContainer: {
    backgroundColor: "#2AC1BC", // 브랜드 메인 컬러 (민트색)
    paddingTop: 60, // 상단 노치 영역 확보
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchBarContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    height: 48,
    // 그림자 (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // 그림자 (Android)
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
  },
  // 카테고리 영역 스타일
  categoryContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // 공간 부족 시 다음 줄로 개행
    justifyContent: "flex-start",
  },
  categoryCard: {
    width: CARD_WIDTH,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8FAFA", // 은은한 민트빛 배경색
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D2F2F1",
  },
  initialText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2AC1BC", // 첫 글자를 강조할 브랜드 포인트 컬러
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#444",
    textAlign: "center",
  },
});
