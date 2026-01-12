# User


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**avatarUrl** | **string** | 头像地址 | [optional] [default to undefined]
**createTime** | **string** | 创建时间 | [optional] [default to undefined]
**email** | **string** | 邮箱 | [optional] [default to undefined]
**password** | **string** | 密码 | [optional] [default to undefined]
**phone** | **string** | 手机号 | [optional] [default to undefined]
**storeId** | **number** | 外键，关联门店id | [optional] [default to undefined]
**updateTime** | **string** | 更新时间 | [optional] [default to undefined]
**userId** | **number** | 用户唯一id | [optional] [default to undefined]
**userType** | **number** | 用户类型：1-宠物主人，2-门店员工 | [optional] [default to undefined]
**username** | **string** | 用户名/登录账号 | [optional] [default to undefined]

## Example

```typescript
import { User } from './api';

const instance: User = {
    avatarUrl,
    createTime,
    email,
    password,
    phone,
    storeId,
    updateTime,
    userId,
    userType,
    username,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
