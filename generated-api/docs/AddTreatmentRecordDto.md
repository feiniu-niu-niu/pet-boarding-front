# AddTreatmentRecordDto

新增治疗记录参数

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**actualCost** | **number** | 实际治疗费用 | [optional] [default to undefined]
**actualTreatment** | **string** | 实际执行的治疗方案 | [optional] [default to undefined]
**approvalId** | **number** | 审批ID（外键，关联审批id） | [default to undefined]
**medicationsUsed** | **string** | 药物详情 | [optional] [default to undefined]
**treatmentTime** | **string** | 治疗时间（不传则使用当前时间） | [optional] [default to undefined]

## Example

```typescript
import { AddTreatmentRecordDto } from './api';

const instance: AddTreatmentRecordDto = {
    actualCost,
    actualTreatment,
    approvalId,
    medicationsUsed,
    treatmentTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
