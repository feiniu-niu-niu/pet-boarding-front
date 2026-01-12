# UpdateUserDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**avatarUrl** | **string** | 头像地址 | [optional] [default to undefined]
**email** | **string** | 邮箱 | [optional] [default to undefined]
**newPassword** | **string** | 新密码 | [optional] [default to undefined]
**oldPassword** | **string** | 原密码 | [optional] [default to undefined]
**phone** | **string** | 手机号 | [optional] [default to undefined]
**userId** | **number** | 用户唯一id | [optional] [default to undefined]
**username** | **string** | 用户名/登录账号 | [optional] [default to undefined]

## Example

```typescript
import { UpdateUserDto } from './api';

const instance: UpdateUserDto = {
    avatarUrl,
    email,
    newPassword,
    oldPassword,
    phone,
    userId,
    username,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
