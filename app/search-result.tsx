import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { searchShops, ShopSearchResponse } from "../src/api/shopService";

export default function SearchResultScreen() {
  const { keyword: urlKeyword, categoryId: urlCategoryId } =
    useLocalSearchParams<{
      keyword?: string;
      categoryId?: string;
    }>();
  const router = useRouter();

  const [shops, setShops] = useState<ShopSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // 💡 새로운 주소 파라미터가 들어올 때마다 로딩바를 켜줍니다.
        setIsLoading(true);

        const currentKeyword = urlKeyword || "";
        const currentCategoryId = urlCategoryId ? Number(urlCategoryId) : null;

        // 💡 서비스 함수에 url 파라미터들을 그대로 토스만 해주면 끝!
        const data = await searchShops(currentKeyword, currentCategoryId);
        setShops(data);
      } catch (error) {
        console.log(
          "401 error 처리를 했으므로 여기선 조용히 무시하거나 예외 처리",
        );
      } finally {
        // 💡 [수정] 데이터 요청이 끝났으므로 로딩 상태를 해제합니다.
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [urlKeyword, urlCategoryId]);

  return (
    <View style={styles.container}>
      {/* 뒤로가기 및 상단 타이틀 바 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {urlKeyword && urlKeyword.trim() != ""
            ? `'${urlKeyword}' 검색 결과`
            : "카테고리 추천 가게"}
        </Text>
        <View style={styles.headerRightSpace} />
        {/* 💡 좌우 밸런스 정밀 튜닝 */}
      </View>

      {/* 💡 텍스트 노드 에러 원인이었던 주석 부분을 깔끔하게 삼항 연산자로 대체 */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#2AC1BC" style={{ flex: 1 }} />
      ) : shops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            검색 결과에 맞는 가게가 없습니다.
          </Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled" // 💡 키보드가 열려있어도 리스트 터치가 잘 먹히도록 설정
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.shopCard}
              onPress={() => console.log(`${item.name} 가게 상세로 이동 예정`)}
            >
              <View style={styles.shopImageDummy}>
                <Text style={styles.imageText}>가게 사진</Text>
              </View>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{item.name}</Text>
                <Text style={styles.shopCategory}>
                  {item.categoryNames && item.categoryNames.length > 0
                    ? item.categoryNames.join(", ")
                    : "카테고리 없음"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerRightSpace: { width: 32 }, // 💡 뒤로가기 버튼과 대칭을 이루도록 너비 조정
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999" },
  shopCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  shopImageDummy: {
    width: 80,
    height: 80,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: { fontSize: 11, color: "#aaa" },
  shopInfo: { flex: 1, padding: 12, justifyContent: "center" },
  shopName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  shopCategory: { fontSize: 13, color: "#666" },
});
