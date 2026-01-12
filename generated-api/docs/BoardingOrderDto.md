# BoardingOrderDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cageId** | **number** | 笼位 | [optional] [default to undefined]
**endDate** | **string** | 结束寄养时间 | [optional] [default to undefined]
**orderStatus** | **number** | 订单状态: 1-待确认, 2-已预约(定金已付), 3-寄养中(已入托), 4-待结算, 5-已完成, 0-已取消 | [optional] [default to undefined]
**petId** | **number** | 宠物 | [optional] [default to undefined]
**serviceQuantities** | **{ [key: string]: number; }** | 服务项数量映射 { serviceId: quantity } | [optional] [default to undefined]
**startDate** | **string** | 开始寄养时间 | [optional] [default to undefined]
**storeId** | **number** | 门店 | [optional] [default to undefined]
**userId** | **number** | 宠物主人 | [optional] [default to undefined]

## Example

```typescript
import { BoardingOrderDto } from './api';

const instance: BoardingOrderDto = {
    cageId,
    endDate,
    orderStatus,
    petId,
    serviceQuantities,
    startDate,
    storeId,
    userId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
