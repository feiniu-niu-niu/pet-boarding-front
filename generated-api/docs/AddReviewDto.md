# AddReviewDto

新增评价参数

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**comment** | **string** | 文字评价 | [optional] [default to undefined]
**orderId** | **string** | 订单ID（外键，关联订单id） | [default to undefined]
**rating** | **number** | 综合评分（1-5分） | [default to undefined]
**userId** | **number** | 评价用户ID | [default to undefined]

## Example

```typescript
import { AddReviewDto } from './api';

const instance: AddReviewDto = {
    comment,
    orderId,
    rating,
    userId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
