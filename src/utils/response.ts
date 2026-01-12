/**
 * 响应码工具函数
 * 用于统一处理后端返回的响应码
 */

// 后端成功响应码
export const SUCCESS_CODE = 100200;

/**
 * 判断响应是否成功
 * @param code 响应码
 * @returns 是否成功
 */
export const isSuccess = (code?: number): boolean => {
  return code === SUCCESS_CODE;
};

/**
 * 判断响应是否失败
 * @param code 响应码
 * @returns 是否失败
 */
export const isError = (code?: number): boolean => {
  return code !== undefined && code !== SUCCESS_CODE;
};

