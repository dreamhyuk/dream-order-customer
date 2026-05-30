import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getMenuDetail,
  MenuDetailResponse,
} from "../../../../src/api/menuService";

export default function MenuDetailScreen() {
  const { shopId, menuId } = useLocalSearchParams<{
    shopId: string;
    menuId: string;
  }>();
  const router = useRouter();

  const [menuDetail, setMenuDetail] = useState<MenuDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        if (shopId && menuId) {
          const data = await getMenuDetail(Number(shopId), Number(menuId));
          setMenuDetail(data);
        }
      } catch (error) {
        console.error("메뉴 상세 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [shopId, menuId]);

  const handleQuantityChange = (type: "plus" | "minus") => {
    if (type === "plus") setQuantity((prev) => prev + 1);
    if (type === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  if (isLoading) {
    return (
      <ActivityIndicator size="large" color="#2AC1BC" style={{ flex: 1 }} />
    );
  }

  if (!menuDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text>메뉴 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const totalAmount = menuDetail.price * quantity;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageHeaderDummy}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.imageText}>📸 메뉴 큰 사진 영역</Text>
        </View>

        <View style={styles.menuInfoContainer}>
          <Text style={styles.groupBadge}>{menuDetail.menuGroupName}</Text>
          <Text style={styles.menuName}>{menuDetail.menuName}</Text>

          {/* <Text style={styles.menuDescription}>
            {menuDetail.description || "엄선된 재료로 만들어 깊은 풍미를 자랑하는 대표 메뉴입니다."}
          </Text> */}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>가격</Text>
            <Text style={styles.priceValue}>
              {menuDetail.price.toLocaleString()}원
            </Text>
          </View>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>수량</Text>
          <View style={styles.quantityController}>
            <TouchableOpacity
              onPress={() => handleQuantityChange("minus")}
              style={[styles.qtyBtn, quantity === 1 && styles.qtyBtnDisabled]}
              disabled={quantity === 1}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => handleQuantityChange("plus")}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() =>
            console.log(
              `장바구니 담기: 메뉴ID ${menuDetail.menuId}, 수량 ${quantity}개`,
            )
          }
        >
          <Text style={styles.cartButtonText}>
            {totalAmount.toLocaleString()}원 장바구니 담기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 120 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageHeaderDummy: {
    width: "100%",
    height: 260,
    backgroundColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  menuInfoContainer: {
    padding: 20,
    borderBottomWidth: 8,
    borderColor: "#f5f5f5",
  },
  groupBadge: {
    fontSize: 12,
    color: "#2AC1BC",
    fontWeight: "bold",
    marginBottom: 6,
  },
  menuName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  menuDescription: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  priceValue: { fontSize: 18, fontWeight: "bold", color: "#333" },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  quantityLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  quantityController: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  qtyBtnDisabled: { backgroundColor: "#f5f5f5" },
  qtyBtnText: { fontSize: 18, color: "#333" },
  qtyText: { paddingHorizontal: 16, fontSize: 15, fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  cartButton: {
    backgroundColor: "#2AC1BC",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cartButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
