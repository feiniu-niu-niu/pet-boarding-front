import type { Dayjs } from "dayjs";
import type { PriceInfo, ServiceItem } from "../services/api";

/**
 * 根据宠物体重判断宠物大小
 * @param weight 宠物体重（kg）
 * @returns 宠物大小：'小型' | '中型' | '大型'
 */
export const getPetSizeByWeight = (weight: number): string => {
  if (weight <= 0) {
    return "小型";
  }
  if (weight <= 10) {
    return "小型";
  } else if (weight <= 25) {
    return "中型";
  } else {
    return "大型";
  }
};

/**
 * 匹配价格信息
 * 根据宠物类型和体重大小匹配对应的每日价格
 * @param prices 价格列表
 * @param petType 宠物类型（如：狗、猫）
 * @param petSize 宠物大小（如：小型、中型、大型）
 * @returns 匹配的价格信息，如果找不到则返回 null
 */
/**
 * 从petSize字符串中提取大小类型（处理 "小型(<=7.5kg)" 这样的格式）
 * @param petSizeStr 宠物大小字符串，如 "小型" 或 "小型(<=7.5kg)"
 * @returns 提取的大小类型，如 "小型"、"中型"、"大型"
 */
const extractSizeType = (petSizeStr?: string): string => {
  if (!petSizeStr) return "";
  // 移除英文括号和中文括号及其中的内容，只保留大小类型
  // 例如："小型(<=7.5kg)" -> "小型"
  // 例如："小型（<=7.5kg）" -> "小型"
  return petSizeStr
    .replace(/\([^)]*\)/g, "")  // 移除英文括号 ()
    .replace(/（[^）]*）/g, "")  // 移除中文括号 （）
    .trim();
};

export const matchPriceInfo = (
  prices: PriceInfo[],
  petType: string,
  petSize: string
): PriceInfo | null => {
  if (!prices || prices.length === 0) {
    return null;
  }

  // 优先匹配：宠物类型 + 宠物大小（精确匹配）
  // 处理价格列表中可能包含括号的格式，如 "小型(<=7.5kg)" 或 "小型（<=7.5kg）"
  let matched = prices.find((price) => {
    const category = (price.petCategory || "").trim();
    const size = (price.petSize || "").trim();
    const extractedSize = extractSizeType(size);
    
    return (
      category === petType &&
      (size === petSize || extractedSize === petSize)
    );
  });

  if (matched) {
    return matched;
  }

  // 次优匹配：宠物类型 + "任意"大小（也需要处理带括号的格式）
  matched = prices.find((price) => {
    const category = (price.petCategory || "").trim();
    const size = (price.petSize || "").trim();
    const extractedSize = extractSizeType(size);
    
    return (
      category === petType &&
      (size === "任意" || size === "全部" || !size || 
       extractedSize === "任意" || extractedSize === "全部")
  );
  });

  if (matched) {
    return matched;
  }

  // 第三匹配：任意类型 + 匹配大小（根据体重匹配，即使类型不同）
  matched = prices.find((price) => {
    const category = (price.petCategory || "").trim();
    const size = (price.petSize || "").trim();
    const extractedSize = extractSizeType(size);
    
    return (
      (category === "任意" || category === "全部" || !category) &&
      (size === petSize || extractedSize === petSize)
    );
  });

  if (matched) {
    return matched;
  }

  // 最后匹配：任意类型 + "任意"大小
  matched = prices.find((price) => {
    const category = (price.petCategory || "").trim();
    const size = (price.petSize || "").trim();
    const extractedSize = extractSizeType(size);
    
    return (
      (category === "任意" || category === "全部" || !category) &&
      (size === "任意" || size === "全部" || !size ||
       extractedSize === "任意" || extractedSize === "全部")
    );
  });

  if (matched) {
    return matched;
  }

  // 如果都匹配不上，返回第一个价格（作为默认）
  return prices[0] || null;
};

/**
 * 计算天数（向上取整）
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 天数
 */
export const calculateDays = (startTime: Dayjs, endTime: Dayjs): number => {
  if (!startTime || !endTime) {
    return 0;
  }

  const diffInHours = endTime.diff(startTime, "hour", true);
  // 如果不足一天，按一天计算
  const days = Math.ceil(diffInHours / 24);
  return days > 0 ? days : 1;
};

/**
 * 计算服务项总价
 * @param serviceQuantities 服务项数量映射 { serviceId: quantity }
 * @param serviceList 服务项列表
 * @returns 服务项总价
 */
export const calculateServicePrice = (
  serviceQuantities: Record<number, number>,
  serviceList: ServiceItem[]
): number => {
  let total = 0;

  Object.entries(serviceQuantities).forEach(([serviceId, quantity]) => {
    if (quantity && quantity > 0) {
      const service = serviceList.find(
        (s) => s.serviceId === Number(serviceId)
      );
      if (service && service.price !== undefined) {
        total += service.price * quantity;
      }
    }
  });

  return total;
};

/**
 * 计算总价格
 * @param params 计算参数
 * @returns 价格计算结果
 */
export interface CalculatePriceParams {
  prices: PriceInfo[]; // 门店价格列表
  petType?: string; // 宠物类型
  petWeight?: number; // 宠物体重（kg）
  startTime?: Dayjs; // 开始时间
  endTime?: Dayjs; // 结束时间
  serviceQuantities?: Record<number, number>; // 服务项数量映射
  serviceList?: ServiceItem[]; // 服务项列表
}

export interface PriceCalculationResult {
  basePrice: number; // 基础价格（住宿价格）
  servicePrice: number; // 服务价格
  totalPrice: number; // 总价格
  days: number; // 天数
  pricePerDay: number; // 每日价格
  matchedPriceInfo: PriceInfo | null; // 匹配的价格信息
}

export const calculatePrice = (
  params: CalculatePriceParams
): PriceCalculationResult => {
  const {
    prices = [],
    petType,
    petWeight,
    startTime,
    endTime,
    serviceQuantities = {},
    serviceList = [],
  } = params;

  // 初始化结果
  let basePrice = 0;
  let servicePrice = 0;
  let totalPrice = 0;
  let days = 0;
  let pricePerDay = 0;
  let matchedPriceInfo: PriceInfo | null = null;

  // 计算天数
  if (startTime && endTime) {
    days = calculateDays(startTime, endTime);
  }

  // 步骤1：根据宠物类型和体重大小匹配价格列表，获取每日价格
  if (petType && petWeight !== undefined && petWeight > 0) {
    // 根据体重判断宠物大小（小型/中型/大型）
    const petSize = getPetSizeByWeight(petWeight);
    
    // 从价格列表中匹配对应的价格信息
    matchedPriceInfo = matchPriceInfo(prices, petType, petSize);

    // 如果匹配成功，获取每日价格
    if (matchedPriceInfo && matchedPriceInfo.pricePerDay !== undefined) {
      pricePerDay = matchedPriceInfo.pricePerDay;
      // 步骤2：每日价格 × 天数 = 基础住宿费用
      basePrice = pricePerDay * days;
    }
  }

  // 步骤3：计算服务项费用
  if (serviceList.length > 0) {
    servicePrice = calculateServicePrice(serviceQuantities, serviceList);
  }

  // 步骤4：基础住宿费用 + 服务费用 = 总价格
  totalPrice = basePrice + servicePrice;

  return {
    basePrice,
    servicePrice,
    totalPrice,
    days,
    pricePerDay,
    matchedPriceInfo,
  };
};
