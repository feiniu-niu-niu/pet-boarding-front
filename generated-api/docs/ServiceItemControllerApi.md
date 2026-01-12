# ServiceItemControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getServiceItemUsingPOST**](#getserviceitemusingpost) | **POST** /service-item/getServiceItem/{storeId} | 获取特殊需求|

# **getServiceItemUsingPOST**
> R getServiceItemUsingPOST()


### Example

```typescript
import {
    ServiceItemControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServiceItemControllerApi(configuration);

let storeId: number; //storeId (default to undefined)

const { status, data } = await apiInstance.getServiceItemUsingPOST(
    storeId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**number**] | storeId | defaults to undefined|


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
|**201** | Created |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

