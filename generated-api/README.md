# Generated API 使用指南

## 📁 为什么生成这么多文件？

这些文件是由 **OpenAPI Generator** 根据后端 API 规范自动生成的 TypeScript 客户端代码。文件虽多，但各司其职：

### 文件说明

| 文件 | 作用 |
|------|------|
| `api.ts` | **核心文件** - 包含所有 API 类和方法（如 `UserManagementApi`） |
| `configuration.ts` | **配置类** - 用于设置 API 基础路径、认证信息等 |
| `base.ts` | **基础类** - 包含 BaseAPI、错误处理、常量等 |
| `common.ts` | **工具函数** - HTTP 请求相关的辅助函数 |
| `index.ts` | **入口文件** - 导出所有需要的内容 |
| `docs/` | **API 文档** - 自动生成的 API 使用文档 |

### 推荐的使用方式

**最简单的方式：直接使用 API 类**

```typescript
import { UserManagementApi, Configuration } from '@/generated-api';

// 1. 创建配置
const configuration = new Configuration({
  basePath: 'http://localhost:8080', // 后端 API 地址
  // 可以添加认证 token
  accessToken: () => localStorage.getItem('token') || ''
});

// 2. 创建 API 实例
const userApi = new UserManagementApi(configuration);

// 3. 调用 API 方法
try {
  const response = await userApi.loginUsingPOST(username, password);
  const { data } = response; // data 是 R 类型，包含 code, data, msg
  console.log('登录成功:', data);
} catch (error) {
  console.error('登录失败:', error);
}
```

## 🔧 实际使用示例

### 示例 1: 用户登录

```typescript
import { UserManagementApi, Configuration, R } from '@/generated-api';

const handleLogin = async (username: string, password: string) => {
  const config = new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  });
  
  const api = new UserManagementApi(config);
  
  try {
    const response = await api.loginUsingPOST(password, username);
    const result: R = response.data;
    
    if (result.code === 200) {
      // 登录成功，保存 token 等
      localStorage.setItem('token', result.data?.token);
      return result.data;
    } else {
      throw new Error(result.msg || '登录失败');
    }
  } catch (error: any) {
    console.error('登录错误:', error);
    throw error;
  }
};
```

### 示例 2: 用户注册

```typescript
import { UserManagementApi, Configuration, User } from '@/generated-api';

const handleRegister = async (userData: User) => {
  const config = new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  });
  
  const api = new UserManagementApi(config);
  
  try {
    const response = await api.registerUsingPOST(userData);
    const result = response.data;
    
    if (result.code === 200) {
      return result.data;
    } else {
      throw new Error(result.msg || '注册失败');
    }
  } catch (error) {
    console.error('注册错误:', error);
    throw error;
  }
};
```

## 💡 最佳实践

### 建议：创建一个统一的 API 服务文件

将 API 配置和调用封装到一个单独的服务文件中，这样更方便管理和维护。

参见：`src/services/api.ts`

## 📚 更多信息

- 查看 `docs/` 目录下的文档了解每个 API 的详细说明
- 这些文件是自动生成的，**不要手动修改**
- 如果后端 API 有变化，需要重新运行生成器来更新这些文件

