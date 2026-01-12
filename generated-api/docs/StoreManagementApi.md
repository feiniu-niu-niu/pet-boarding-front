# StoreManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getStoreByIdUsingPOST**](#getstorebyidusingpost) | **POST** /store/getStoreById/{storeId} | 获取门店详情|
|[**getStoreListUsingPOST**](#getstorelistusingpost) | **POST** /store/getStoreList | 获取门店列表|

# **getStoreByIdUsingPOST**
> R getStoreByIdUsingPOST()


### Example

```typescript
import {
    StoreManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StoreManagementApi(configuration);

let storeId: number; //storeId (default to undefined)

const { status, data } = await apiInstance.getStoreByIdUsingPOST(
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

# **getStoreListUsingPOST**
> R getStoreListUsingPOST(searchStoreDto)


### Example

```typescript
import {
    StoreManagementApi,
    Configuration,
    SearchStoreDto
} from './api';

const configuration = new Configuration();
const apiInstance = new StoreManagementApi(configuration);

let searchStoreDto: SearchStoreDto; //searchStoreDto

const { status, data } = await apiInstance.getStoreListUsingPOST(
    searchStoreDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **searchStoreDto** | **SearchStoreDto**| searchStoreDto | |


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

