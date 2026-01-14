/**
 * 认证工具函数
 * 用于管理用户认证状态、token 和用户信息
 */

// Token 存储键名
const TOKEN_KEY = 'token';
// 用户信息存储键名
const USER_INFO_KEY = 'userInfo';
// 经度存储键名
const LONGITUDE_KEY = 'longitude';
// 纬度存储键名
const LATITUDE_KEY = 'latitude';

/**
 * 用户信息接口
 */
export interface UserInfo {
  userId?: number;
  username?: string;
  email?: string;
  avatarUrl?: string;
  userType?: number;
  storeId?: number;
  petList?: any[]; // 宠物列表
  [key: string]: any;
}

/**
 * 设置 token
 * @param token 认证 token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 获取 token
 * @returns token 字符串，如果不存在则返回 null
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 设置用户信息
 * @param userInfo 用户信息对象
 */
export const setUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

/**
 * 获取用户信息
 * @returns 用户信息对象，如果不存在则返回 null
 */
export const getUserInfo = (): UserInfo | null => {
  const userInfoStr = localStorage.getItem(USER_INFO_KEY);
  if (!userInfoStr) {
    return null;
  }
  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return null;
  }
};

/**
 * 判断用户是否已认证
 * @returns 是否已认证
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

/**
 * 清除认证信息（登出）
 */
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  clearLocation();
};

/**
 * 登出
 * 清除认证信息并刷新页面
 */
export const logout = (): void => {
  clearAuth();
};

// 高德地图 API 类型声明（保留用于 index.html 中的高德地图脚本）
declare global {
  interface Window {
    AMap?: any;
  }
}

/**
 * 获取当前位置信息（经纬度）
 * 使用浏览器原生定位 API（会弹出权限确认对话框）
 * @returns Promise<{longitude: number, latitude: number}> 经纬度信息
 */
export const getCurrentLocation = (): Promise<{ longitude: number; latitude: number }> => {
  return new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('浏览器不支持定位功能'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;
        console.log('浏览器定位成功:', { longitude, latitude });
      resolve({
        longitude,
        latitude,
      });
    },
    (error) => {
      let errorMessage = '获取位置信息失败';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '用户拒绝了位置权限请求';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置信息不可用';
          break;
        case error.TIMEOUT:
          errorMessage = '获取位置信息超时';
          break;
        default:
          errorMessage = '获取位置信息时发生未知错误';
          break;
      }
        console.error('浏览器定位失败:', errorMessage);
      reject(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true, // 启用高精度定位
      timeout: 15000, // 15秒超时
      maximumAge: 0, // 不使用缓存的位置信息
    }
  );
  });
};

/**
 * 设置经度
 * @param longitude 经度
 */
export const setLongitude = (longitude: number): void => {
  localStorage.setItem(LONGITUDE_KEY, longitude.toString());
};

/**
 * 获取经度
 * @returns 经度，如果不存在则返回 null
 */
export const getLongitude = (): number | null => {
  const longitude = localStorage.getItem(LONGITUDE_KEY);
  return longitude ? parseFloat(longitude) : null;
};

/**
 * 设置纬度
 * @param latitude 纬度
 */
export const setLatitude = (latitude: number): void => {
  localStorage.setItem(LATITUDE_KEY, latitude.toString());
};

/**
 * 获取纬度
 * @returns 纬度，如果不存在则返回 null
 */
export const getLatitude = (): number | null => {
  const latitude = localStorage.getItem(LATITUDE_KEY);
  return latitude ? parseFloat(latitude) : null;
};

/**
 * 清除位置信息
 */
export const clearLocation = (): void => {
  localStorage.removeItem(LONGITUDE_KEY);
  localStorage.removeItem(LATITUDE_KEY);
};

