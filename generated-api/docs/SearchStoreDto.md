# SearchStoreDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**isActive** | **number** | 是否营业：1-是，0-否 | [optional] [default to undefined]
**keyword** | **string** | 搜索关键词（可搜索门店名称或地址） | [optional] [default to undefined]
**latitude** | **number** | 纬度 | [optional] [default to undefined]
**longitude** | **number** | 经度 | [optional] [default to undefined]

## Example

```typescript
import { SearchStoreDto } from './api';

const instance: SearchStoreDto = {
    isActive,
    keyword,
    latitude,
    longitude,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
