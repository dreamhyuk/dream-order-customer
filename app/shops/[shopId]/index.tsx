import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// 💡 작성해 둔 shopService에서 실제 함수와 인터페이스를 불러옵니다.
import {
  getShopDetail,
  getShopMenus,
  MenuGroupResponse,
  ShopDetailResponse,
} from "../../../src/api/shopService";

export default function ShopDetailScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const router = useRouter();

  const [shopInfo, setShopInfo] = useState<ShopDetailResponse | null>(null);
  const [menuGroups, setMenuGroups] = useState<MenuGroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  // 스크롤 이동 제어용 메인 ScrollView Ref
  const mainScrollViewRef = useRef<ScrollView>(null);
  // 각 메뉴 그룹 카드의 Y축 위치(Layout)를 기록할 객체
  const [groupLayouts, setGroupLayouts] = useState<{ [key: number]: number }>(
    {},
  );

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoading(true);
        const id = Number(shopId);

        // 💡 [실제 API 연동] 백엔드와 맞춘 두 API를 병렬로 빠르게 호출합니다.
        const [detailData, menusData] = await Promise.all([
          getShopDetail(id),
          getShopMenus(id),
        ]);

        setShopInfo(detailData);

        // 백엔드 priority(우선순위) 필드가 있다면 프론트에서 한 번 더 정렬해 주면 안전합니다.
        const sortedMenus = [...menusData].sort(
          (a, b) => a.priority - b.priority,
        );
        setMenuGroups(sortedMenus);
      } catch (error) {
        console.error("가게 상세 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (shopId) fetchShopData();
  }, [shopId]);

  // 탭 클릭 시 해당 메뉴 그룹 섹션의 Y축 위치로 스크롤 이동
  const handleTabPress = (index: number, groupId: number) => {
    setActiveTab(index);
    const yPosition = groupLayouts[groupId];
    if (yPosition !== undefined && mainScrollViewRef.current) {
      mainScrollViewRef.current.scrollTo({
        y: yPosition,
        animated: true,
      });
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator size="large" color="#2AC1BC" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. 상단 백버튼 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shopInfo?.shopName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 메인 스크롤 뷰 */}
      <ScrollView
        ref={mainScrollViewRef}
        stickyHeaderIndices={[1]} // 메뉴 탭 바 고정
        scrollEventThrottle={16}
      >
        {/* 2. 가게 기본 정보 카드 (백엔드 ShopDetailResponseDto 반영) */}
        <View style={styles.shopInfoCard}>
          <Text style={styles.shopName}>{shopInfo?.shopName}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{shopInfo?.averageRating}</Text>
            <Text style={styles.reviewCount}>
              (리뷰 {shopInfo?.reviewCount}개)
            </Text>
          </View>
          <Text style={styles.addressText}>
            📍{" "}
            {shopInfo
              ? `${shopInfo.address.city} ${shopInfo.address.street}`
              : ""}
          </Text>
        </View>

        {/* 3. 메뉴 그룹 가로 탭 바 (MenuGroupResponseDto의 name 매핑) */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalTabs}
          >
            {menuGroups.map((group, index) => (
              <TouchableOpacity
                key={group.menuGroupId}
                style={[
                  styles.tabButton,
                  activeTab === index && styles.activeTabButton,
                ]}
                onPress={() => handleTabPress(index, group.menuGroupId)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                  ]}
                >
                  {group.name} {/* 💡 menuGroupName에서 name으로 수정 */}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. 하단 세로 메뉴 리스트 바디 (MenuSummaryResponseDto 반영) */}
        <View style={styles.menuListBody}>
          {menuGroups.map((group) => (
            <View
              key={group.menuGroupId}
              style={styles.groupSection}
              // 렌더링 시점에 Y축 절대 좌표를 수집하여 저장
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                setGroupLayouts((prev) => ({
                  ...prev,
                  [group.menuGroupId]: y,
                }));
              }}
            >
              {/* 💡 menuGroupName에서 name으로 수정 */}
              <Text style={styles.groupTitle}>{group.name}</Text>

              {group.menus.map((menu) => (
                <TouchableOpacity
                  key={menu.id} // 💡 menuId에서 id로 수정
                  style={styles.menuItemCard}
                  // 💡 백엔드 URL 패턴 및 Expo Router 동적 라우팅 매핑
                  onPress={() =>
                    router.push(`/shops/${shopId}/menus/${menu.id}` as any)
                  }
                >
                  <View style={styles.menuInfo}>
                    {/* 💡 name에서 menuName으로 수정 */}
                    <Text style={styles.menuName}>{menu.menuName}</Text>
                    <Text style={styles.menuPrice}>
                      {menu.price.toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.menuImageDummy}>
                    <Text style={styles.imageText}>메뉴 사진</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
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
    borderColor: "#f5f5f5",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  shopInfoCard: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 8,
    borderColor: "#f5f5f5",
  },
  shopName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  star: { fontSize: 16, marginRight: 4 },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 4,
  },
  reviewCount: { fontSize: 14, color: "#888" },
  addressText: { fontSize: 14, color: "#666" },
  tabBarContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  horizontalTabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  activeTabButton: { backgroundColor: "#2AC1BC" },
  tabText: { fontSize: 14, color: "#666" },
  activeTabText: { color: "#fff", fontWeight: "bold" },
  menuListBody: { paddingBottom: 100 },
  groupSection: { padding: 16, borderBottomWidth: 1, borderColor: "#f5f5f5" },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  menuItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f9f9f9",
  },
  menuInfo: { flex: 1, justifyContent: "center" },
  menuName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 6 },
  menuPrice: { fontSize: 14, color: "#555" },
  menuImageDummy: {
    width: 70,
    height: 70,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: { fontSize: 10, color: "#ccc" },
});
