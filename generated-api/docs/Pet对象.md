# Pet


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**age** | **number** | 年龄 | [optional] [default to undefined]
**avatarUrl** | **string** | 宠物头像 | [optional] [default to undefined]
**breed** | **string** | 品种 | [optional] [default to undefined]
**createTime** | **string** | 创建时间 | [optional] [default to undefined]
**medicalHistory** | **string** | 过往病史 | [optional] [default to undefined]
**name** | **string** | 宠物昵称 | [optional] [default to undefined]
**petId** | **number** | 宠物唯一id | [optional] [default to undefined]
**specialHabits** | **string** | 特殊习性，如“怕生” | [optional] [default to undefined]
**type** | **string** | 宠物类型 | [optional] [default to undefined]
**userId** | **number** | 外键，关联用户表 | [optional] [default to undefined]
**vaccinationInfo** | **string** | 疫苗接种情况（文字描述） | [optional] [default to undefined]
**weight** | **number** | 体重 | [optional] [default to undefined]

## Example

```typescript
import { Pet } from './api';

const instance: Pet = {
    age,
    avatarUrl,
    breed,
    createTime,
    medicalHistory,
    name,
    petId,
    specialHabits,
    type,
    userId,
    vaccinationInfo,
    weight,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
