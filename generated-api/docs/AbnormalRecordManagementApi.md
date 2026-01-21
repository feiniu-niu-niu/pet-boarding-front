# AbnormalRecordManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addUsingPOST**](#addusingpost) | **POST** /abnormal-record/add | 门店员工新增异常记录（如需治疗且需通知主人则推送 SSE 并生成审批）|
|[**decideUsingPOST**](#decideusingpost) | **POST** /abnormal-record/treatment-approval/decision | 主人对治疗审批做决定（同意/拒绝）|
|[**getPendingApprovalsUsingGET**](#getpendingapprovalsusingget) | **GET** /abnormal-record/treatment-approval/pending | 查询当前用户待处理的治疗审批列表|
|[**subscribeUsingGET**](#subscribeusingget) | **GET** /abnormal-record/sse/subscribe | 主人订阅 SSE（用于接收异常/治疗审批通知）|

# **addUsingPOST**
> R addUsingPOST(dto)


### Example

```typescript
import {
    AbnormalRecordManagementApi,
    Configuration,
    AddAbnormalRecordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AbnormalRecordManagementApi(configuration);

let dto: AddAbnormalRecordDto; //dto

const { status, data } = await apiInstance.addUsingPOST(
    dto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dto** | **AddAbnormalRecordDto**| dto | |


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

# **decideUsingPOST**
> R decideUsingPOST(dto)


### Example

```typescript
import {
    AbnormalRecordManagementApi,
    Configuration,
    TreatmentDecisionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AbnormalRecordManagementApi(configuration);

let dto: TreatmentDecisionDto; //dto

const { status, data } = await apiInstance.decideUsingPOST(
    dto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dto** | **TreatmentDecisionDto**| dto | |


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

# **getPendingApprovalsUsingGET**
> R getPendingApprovalsUsingGET()


### Example

```typescript
import {
    AbnormalRecordManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AbnormalRecordManagementApi(configuration);

let userId: number; //userId (default to undefined)

const { status, data } = await apiInstance.getPendingApprovalsUsingGET(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] | userId | defaults to undefined|


### Return type

**R**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **subscribeUsingGET**
> SseEmitter subscribeUsingGET()


### Example

```typescript
import {
    AbnormalRecordManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AbnormalRecordManagementApi(configuration);

let userId: number; //userId (default to undefined)

const { status, data } = await apiInstance.subscribeUsingGET(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] | userId | defaults to undefined|


### Return type

**SseEmitter**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

