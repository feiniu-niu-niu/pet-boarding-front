# CareLogDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**careItem** | **string** | 照料项目 | [default to undefined]
**details** | **string** | 详细记录 | [optional] [default to undefined]
**logDate** | **string** | 日志日期（可选，不传则使用当前时间） | [optional] [default to undefined]
**logTime** | [**LocalTime**](LocalTime.md) |  | [optional] [default to undefined]
**operatorId** | **number** | 外键，用户（员工）id | [optional] [default to undefined]
**orderId** | **string** | 外键，关联订单 | [default to undefined]

## Example

```typescript
import { CareLogDto } from './api';

const instance: CareLogDto = {
    careItem,
    details,
    logDate,
    logTime,
    operatorId,
    orderId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
