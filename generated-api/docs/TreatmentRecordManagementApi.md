# TreatmentRecordManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addTreatmentRecordUsingPOST**](#addtreatmentrecordusingpost) | **POST** /treatment-record/add | 新增治疗记录及费用（门店员工操作）|

# **addTreatmentRecordUsingPOST**
> R addTreatmentRecordUsingPOST(dto)


### Example

```typescript
import {
    TreatmentRecordManagementApi,
    Configuration,
    AddTreatmentRecordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TreatmentRecordManagementApi(configuration);

let dto: AddTreatmentRecordDto; //dto

const { status, data } = await apiInstance.addTreatmentRecordUsingPOST(
    dto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dto** | **AddTreatmentRecordDto**| dto | |


### Return type

**R**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**201** | Created |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

