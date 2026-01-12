/**
 * API 服务封装
 * 统一管理所有 API 调用
 */
import axios from 'axios';
import { 
  UserManagementApi, 
  PetManagementApi,
  FileUploadManagementApi,
  StoreManagementApi,
  ServiceItemControllerApi,
  BoardingOrderManagementApi,
  Configuration,
  type User,
  type UpdateUserDto,
  type Pet,
  type R,
  type SearchStoreDto,
  type BoardingOrderDto
} from '../../generated-api';
import { isSuccess } from '../utils/response';

/**
 * 获取后端基础 URL（用于图片资源）
 */
const getBackendBaseUrl = (): string => {
  return import.meta.env.DEV 
    ? 'http://localhost:8080'  // 开发环境直接使用完整 URL（图片资源不走代理）
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
};

/**
 * 处理头像 URL，确保返回完整的 URL
 * @param avatarUrl 后端返回的头像 URL（可能是相对路径、文件名或完整 URL）
 * @param type 头像类型：'user'、'pet' 或 'store'
 * @returns 完整的头像 URL
 */
export const getAvatarUrl = (avatarUrl?: string, type: 'user' | 'pet' | 'store' = 'user'): string => {
  if (!avatarUrl) {
    return '';
  }
  
  // 去除首尾空格
  avatarUrl = avatarUrl.trim();
  
  // 如果已经是完整 URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  const baseUrl = getBackendBaseUrl();
  const folder = type === 'user' ? 'user' : type === 'pet' ? 'pet' : 'store';
  
  // 如果以 /img/ 开头（相对路径），拼接基础 URL
  if (avatarUrl.startsWith('/img/')) {
    return `${baseUrl}${avatarUrl}`;
  }
  
  // 如果以 img/ 开头（没有前导斜杠），添加前导斜杠
  if (avatarUrl.startsWith('img/')) {
    return `${baseUrl}/${avatarUrl}`;
  }
  
  // 如果以 / 开头但不是 /img/，直接拼接
  if (avatarUrl.startsWith('/')) {
    return `${baseUrl}${avatarUrl}`;
  }
  
  // 如果是文件名（不包含路径），拼接完整路径
  // 检查是否已经包含文件夹路径
  if (avatarUrl.includes('/')) {
    // 如果包含路径但不在 /img/ 下，可能需要特殊处理
    // 这里假设后端可能返回 img/user/xxx.jpg 或 img/pet/xxx.jpg
    if (avatarUrl.startsWith('img/')) {
      return `${baseUrl}/${avatarUrl}`;
    }
    // 如果路径以 user/ 或 pet/ 开头
    if (avatarUrl.startsWith(`${folder}/`)) {
      return `${baseUrl}/img/${avatarUrl}`;
    }
  }
  
  // 默认情况：只有文件名，拼接完整路径
  return `${baseUrl}/img/${folder}/${avatarUrl}`;
};

// API 基础配置
const getApiConfiguration = (): Configuration => {
  // 开发环境使用代理路径，生产环境使用环境变量配置的完整 URL
  const basePath = import.meta.env.DEV 
    ? '/api'  // 开发环境使用代理
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
  
  // 每次获取配置时都重新读取最新的 token
  const getToken = () => {
    return localStorage.getItem('token') || '';
  };
  
  const token = getToken();
  
  return new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'Content-Type': 'application/json',
        // 手动添加 Authorization 头，每次读取最新 token
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    },
    // 使用函数形式，确保每次调用时都获取最新的 token
    accessToken: getToken,
  });
};

// 获取 API 实例 - 每次调用时获取最新配置
const getUserApi = () => {
  return new UserManagementApi(getApiConfiguration());
};

// 获取宠物管理 API 实例 - 每次调用时获取最新配置
const getPetApi = () => {
  return new PetManagementApi(getApiConfiguration());
};

// 获取门店管理 API 实例 - 每次调用时获取最新配置
const getStoreApi = () => {
  return new StoreManagementApi(getApiConfiguration());
};

// 获取服务项管理 API 实例 - 每次调用时获取最新配置
const getServiceItemApi = () => {
  return new ServiceItemControllerApi(getApiConfiguration());
};

// 获取订单管理 API 实例 - 每次调用时获取最新配置
const getBoardingOrderApi = () => {
  return new BoardingOrderManagementApi(getApiConfiguration());
};

// 获取文件上传 API 实例 - 每次调用时获取最新配置
// 文件上传需要特殊的配置，不设置 Content-Type，让浏览器自动设置
const getFileUploadApi = () => {
  const basePath = import.meta.env.DEV 
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
  
  const getToken = () => {
    return localStorage.getItem('token') || '';
  };
  
  const token = getToken();
  
  // 文件上传配置：不设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
  const uploadConfig = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    },
    accessToken: getToken,
  });
  
  return new FileUploadManagementApi(uploadConfig);
};

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果
 */
export const login = async (username: string, password: string): Promise<R> => {
  try {
    // 注意：loginUsingPOST 的参数顺序是 (password, username)
    const response = await getUserApi().loginUsingPOST(password, username);
    return response.data;
  } catch (error: any) {
    console.error('登录失败:', error);
    // 保持错误对象的完整结构，以便上层组件能够提取后端返回的 msg
    const errorWithMsg = error;
    // 如果错误对象没有 response.data.msg，添加一个
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 用户注册
 * @param userData 用户信息
 * @returns 注册结果
 */
export const register = async (userData: User): Promise<R> => {
  try {
    const response = await getUserApi().registerUsingPOST(userData);
    return response.data;
  } catch (error: any) {
    console.error('注册失败:', error);
    // 保持错误对象的完整结构，以便上层组件能够提取后端返回的 msg
    const errorWithMsg = error;
    // 如果错误对象没有 response.data.msg，添加一个
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 获取用户详情
 * @param userId 用户ID
 * @returns 用户详情结果
 */
export const getUserDetail = async (userId: number): Promise<R> => {
  try {
    // 获取当前 token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }
    const userApi = getUserApi();
    const response = await userApi.getUserDetailUsingPOST(userId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('获取用户详情失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 获取当前登录用户的详情
 * @returns 当前用户详情结果
 */
export const getCurrentUserDetail = async (): Promise<R> => {
  // 从 localStorage 获取当前用户信息
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) {
    throw new Error('用户未登录或用户信息不存在');
  }

  try {
    const userInfo = JSON.parse(userInfoStr);
    const userId = userInfo?.userId;
    
    if (!userId) {
      console.error('用户信息:', userInfo);
      throw new Error('用户ID不存在，请重新登录');
    }

    return await getUserDetail(userId);
  } catch (error: any) {
    if (error.message === '用户未登录或用户信息不存在' || error.message === '用户ID不存在') {
      throw error;
    }
    console.error('获取当前用户详情失败:', error);
    throw error;
  }
};

/**
 * 修改当前登录用户的信息
 * @param userData 要修改的用户信息（部分字段，使用 UpdateUserDto 类型）
 * @returns 修改结果
 */
export const updateCurrentUser = async (userData: Partial<UpdateUserDto>): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    // 获取当前用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      throw new Error('用户信息不存在，请先登录');
    }

    const userInfo = JSON.parse(userInfoStr);
    const userId = userInfo?.userId;

    if (!userId) {
      throw new Error('用户ID不存在，请重新登录');
    }

    // 构建 UpdateUserDto 对象，包含 userId 和要修改的字段
    // 如果传入了 password，需要转换为 newPassword
    const updateData: UpdateUserDto = {
      userId,
      username: userData.username || undefined,
      email: userData.email || undefined,
      phone: userData.phone || undefined,
      avatarUrl: userData.avatarUrl || undefined,
      // 如果传入了 password，转换为 newPassword
      newPassword: (userData as any).password || userData.newPassword || undefined,
      oldPassword: userData.oldPassword || undefined,
    };

    // 移除 undefined 字段
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateUserDto] === undefined) {
        delete updateData[key as keyof UpdateUserDto];
      }
    });

    const userApi = getUserApi();
    const response = await userApi.updateUserUsingPOST(updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('修改当前用户失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

// 更新 API 配置（例如登录后更新 token）
export const updateApiToken = (token: string) => {
  localStorage.setItem('token', token);
  // 重新创建配置
  const config = getApiConfiguration();
  // 重新创建 API 实例（如果需要的话，可以导出配置供外部使用）
  return config;
};

/**
 * 宠物信息接口（导出供外部使用，基于生成的 Pet 接口）
 */
export type PetInfo = Pet;

/**
 * 保存宠物（新增或修改）
 * 根据 petId 是否存在判断是新增还是修改
 * @param petData 宠物信息
 * @returns 保存结果
 */
export const savePet = async (petData: Pet): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const petApi = getPetApi();
    const response = await petApi.savePetUsingPOST(petData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('保存宠物失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 添加宠物
 * @param petData 宠物信息
 * @returns 添加结果
 */
export const addPet = async (petData: Partial<Pet>): Promise<R> => {
  try {
    // 获取当前用户ID
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      throw new Error('用户信息不存在，请先登录');
    }

    const userInfo = JSON.parse(userInfoStr);
    const userId = userInfo?.userId;

    if (!userId) {
      throw new Error('用户ID不存在，请重新登录');
    }

    // 构建完整的 Pet 对象
    const pet: Pet = {
      ...petData,
      userId,
      // 新增时不需要 petId
    } as Pet;

    return await savePet(pet);
  } catch (error: any) {
    console.error('添加宠物失败:', error);
    throw error;
  }
};

/**
 * 更新宠物信息
 * @param petId 宠物ID
 * @param petData 宠物信息
 * @returns 更新结果
 */
export const updatePet = async (petId: number, petData: Partial<Pet>): Promise<R> => {
  try {
    // 构建完整的 Pet 对象，包含 petId
    const pet: Pet = {
      ...petData,
      petId,
    } as Pet;

    return await savePet(pet);
  } catch (error: any) {
    console.error('更新宠物失败:', error);
    throw error;
  }
};

/**
 * 删除宠物
 * @param petId 宠物ID
 * @returns 删除结果
 */
export const deletePet = async (petId: number): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const petApi = getPetApi();
    const response = await petApi.deletePetUsingDELETE(petId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('删除宠物失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 上传用户头像
 * @param file 头像文件
 * @returns 上传结果（包含头像URL）
 */
export const uploadUserAvatar = async (file: File): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const basePath = import.meta.env.DEV 
      ? '/api'
      : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
    
    // 直接使用 axios 发送请求，不设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${basePath}/upload/user/avatar`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不设置 Content-Type，让浏览器自动设置（包括 boundary）
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('上传用户头像失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 上传宠物头像
 * @param file 头像文件
 * @returns 上传结果（包含头像URL）
 */
export const uploadPetAvatar = async (file: File): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const basePath = import.meta.env.DEV 
      ? '/api'
      : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
    
    // 直接使用 axios 发送请求，不设置 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${basePath}/upload/pet/avatar`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不设置 Content-Type，让浏览器自动设置（包括 boundary）
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('上传宠物头像失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 更新用户头像（通过用户ID）
 * @param userId 用户ID
 * @param file 头像文件
 * @returns 更新结果
 */
export const updateUserAvatar = async (userId: number, file: File): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const userApi = getUserApi();
    const response = await userApi.updateAvatarUsingPOST(userId, file, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('更新用户头像失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 保存宠物（带头像上传）
 * @param petData 宠物信息
 * @param file 头像文件（可选）
 * @returns 保存结果
 */
export const savePetWithAvatar = async (petData: Pet, file?: File): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const petApi = getPetApi();
    const response = await petApi.savePetWithAvatarUsingPOST(
      petData.age,
      petData.breed,
      petData.medicalHistory,
      petData.name,
      petData.petId,
      petData.specialHabits,
      petData.type,
      petData.userId,
      petData.vaccinationInfo,
      petData.weight,
      file,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('保存宠物（带头像）失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 门店信息接口（基于后端返回的数据结构）
 */
/**
 * 价格信息接口
 */
export interface PriceInfo {
  priceId?: number;
  petCategory?: string; // 宠物类别（如：狗、猫）
  petSize?: string; // 宠物大小（如：小型、中型、大型、任意）
  pricePerDay?: number; // 每日价格
}

export interface StoreInfo {
  storeId?: number;
  name?: string;
  fullAddress?: string;
  address?: string; // 兼容可能的 address 字段
  province?: string; // 省
  city?: string; // 市
  district?: string; // 区
  isActive?: number;
  latitude?: number;
  longitude?: number;
  prices?: PriceInfo[]; // 价格列表
  [key: string]: any; // 允许其他字段
}

/**
 * 搜索门店列表
 * @param keyword 搜索关键词（门店名称或地址）
 * @param options 其他搜索选项（可选）
 * @returns 门店列表结果
 */
export const searchStores = async (
  keyword?: string,
  options?: {
    isActive?: number;
    latitude?: number;
    longitude?: number;
  }
): Promise<StoreInfo[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    // 构建搜索参数
    const searchParams: SearchStoreDto = {
      keyword: keyword?.trim() || undefined,
      isActive: options?.isActive,
      latitude: options?.latitude,
      longitude: options?.longitude,
    };

    // 移除 undefined 字段
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key as keyof SearchStoreDto] === undefined) {
        delete searchParams[key as keyof SearchStoreDto];
      }
    });

    const storeApi = getStoreApi();
    const response = await storeApi.getStoreListUsingPOST(searchParams, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = response.data;
    
    // 处理返回的数据，确保返回 StoreInfo[] 数组
    if (isSuccess(result.code)) {
      const data = result.data;
      let stores: StoreInfo[] = [];
      
      // 如果 data 是数组，直接使用
      if (Array.isArray(data)) {
        stores = data as StoreInfo[];
      } 
      // 如果 data 是对象且包含 list 或 data 字段
      else if (data && typeof data === 'object') {
        const listData = (data as any).list || (data as any).data || (data as any).stores || [];
        stores = Array.isArray(listData) ? listData as StoreInfo[] : [];
      }

      // 确保字段映射正确，保留所有原始字段（包括 reviews）
      return stores.map(store => ({
        ...store, // 保留所有原始字段
        storeId: store.storeId,
        name: store.name,
        fullAddress: store.fullAddress || store.address, // 兼容 address 字段
        isActive: store.isActive,
        latitude: store.latitude,
        longitude: store.longitude,
        description: store.description, // 映射描述字段
        businessHours: store.businessHours, // 映射营业时间字段
        avatarUrl: store.avatarUrl, // 映射头像字段
        distance: store.distance, // 映射距离字段（后端返回）
        reviews: (store as any).reviews, // 明确包含 reviews 字段
      }));
    } else {
      throw new Error(result.msg || '搜索门店失败');
    }
  } catch (error: any) {
    console.error('搜索门店失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 获取门店详情
 * @param storeId 门店ID
 * @returns 门店详情结果
 */
export const getStoreDetail = async (storeId: number): Promise<StoreInfo> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const storeApi = getStoreApi();
    
    // 如果后端有 getStoreByIdUsingPOST 方法，使用它
    // 否则，我们可以通过搜索接口获取单个门店，或者直接调用后端
    // 这里先尝试使用搜索接口，传入 storeId 作为关键词（如果后端支持）
    // 或者直接使用 axios 调用后端接口
    
    // 使用 axios 直接调用后端接口获取门店详情
    // 如果后端有 getStoreByIdUsingPOST 方法，可以替换为：
    // const response = await storeApi.getStoreByIdUsingPOST(storeId, {
    //   headers: { 'Authorization': `Bearer ${token}` },
    // });
    
    const basePath = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
    
    const response = await axios.post(
      `${basePath}/store/getStoreById/${storeId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const result = response.data;
    
    if (isSuccess(result.code)) {
      const store = result.data as StoreInfo;
      return {
        ...store,
        storeId: store.storeId,
        name: store.name,
        fullAddress: store.fullAddress || store.address,
        province: store.province,
        city: store.city,
        district: store.district,
        isActive: store.isActive,
        latitude: store.latitude,
        longitude: store.longitude,
        description: store.description,
        businessHours: store.businessHours,
        avatarUrl: store.avatarUrl,
        distance: store.distance,
        reviews: (store as any).reviews,
        prices: (store as any).prices || [], // 包含价格列表
      };
    } else {
      throw new Error(result.msg || '获取门店详情失败');
    }
  } catch (error: any) {
    console.error('获取门店详情失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 服务项信息接口
 */
export interface ServiceItem {
  serviceId?: number;
  serviceName?: string;
  description?: string;
  price?: number;
  [key: string]: any;
}

/**
 * 获取门店服务列表
 * @param storeId 门店ID
 * @returns 服务列表
 */
export const getServiceItem = async (storeId: number): Promise<ServiceItem[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const serviceItemApi = getServiceItemApi();
    const response = await serviceItemApi.getServiceItemUsingPOST(storeId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = response.data;
    
    if (isSuccess(result.code)) {
      // 如果返回的是数组，直接返回
      if (Array.isArray(result.data)) {
        return result.data as ServiceItem[];
      }
      // 如果返回的是对象，尝试获取其中的数组字段
      if (result.data && Array.isArray(result.data.list)) {
        return result.data.list as ServiceItem[];
      }
      // 如果返回的是单个对象，包装成数组
      if (result.data) {
        return [result.data] as ServiceItem[];
      }
      return [];
    } else {
      throw new Error(result.msg || '获取服务列表失败');
    }
  } catch (error: any) {
    console.error('获取服务列表失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 关联门店
 * @param storeId 门店ID
 * @param userId 用户ID
 * @returns 关联结果
 */
export const associateStore = async (storeId: number, userId: number): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    console.log('发送关联门店请求:', { storeId, userId });
    
    const userApi = getUserApi();
    const response = await userApi.associateStoreUsingPOST(storeId, userId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('关联门店请求成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('关联门店失败:', error);
    console.error('错误详情:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 创建寄养订单
 * @param orderData 订单数据
 * @returns 创建结果
 */
export const addBoardingOrder = async (orderData: BoardingOrderDto): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const orderApi = getBoardingOrderApi();
    const response = await orderApi.addBoardingOrderUsingPOST(orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('创建订单失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 查询寄养订单状态（包含剩余支付时间等）
 */
export const getOrderStatus = async (orderId: string): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    const orderApi = getBoardingOrderApi();
    const response = await orderApi.getOrderStatusUsingGET(orderId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('获取订单状态失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

/**
 * 根据订单状态获取订单列表
 * @param orderStatus 订单状态：1-待确认, 2-已预约(定金已付), 3-寄养中(已入托), 4-待结算, 5-已完成, 0-已取消
 * @returns 订单列表结果
 */
export const getOrderListByStatus = async (orderStatus: number): Promise<R> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token 不存在，请先登录');
    }

    // 获取用户信息以获取 userId
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      throw new Error('用户信息不存在，请先登录');
    }
    
    let userId: number;
    try {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.userId;
      if (!userId) {
        throw new Error('用户ID不存在');
      }
    } catch (error) {
      throw new Error('解析用户信息失败，请重新登录');
    }

    // 使用生成的 API 调用新的 boardingOrderList 接口
    const orderApi = getBoardingOrderApi();
    const response = await orderApi.getOrderListByStatusUsingGET(orderStatus, userId, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('获取订单列表失败:', error);
    const errorWithMsg = error;
    if (error?.response?.data) {
      if (!error.response.data.msg && error.response.data.message) {
        error.response.data.msg = error.response.data.message;
      }
    }
    throw errorWithMsg;
  }
};

// 导出配置函数，方便外部使用
export { getApiConfiguration };

