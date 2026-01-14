# CareLogManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addCareLogUsingPOST**](#addcarelogusingpost) | **POST** /care-log/add | 新增照料记录|
|[**getCareLogDetailUsingGET**](#getcarelogdetailusingget) | **GET** /care-log/detail/{logId} | 查看照料记录详情|
|[**getPetListByStoreIdUsingGET**](#getpetlistbystoreidusingget) | **GET** /care-log/petList | 根据门店ID获取宠物列表（区分今日已上传和今日待上传日志）|
|[**getPetListByUserIdUsingGET**](#getpetlistbyuseridusingget) | **GET** /care-log/petListByUser | 根据宠物主人ID获取宠物列表（查看照料列表，返回字段与门店视角一致）|

# **addCareLogUsingPOST**
> R addCareLogUsingPOST(careLogDto)


### Example

```typescript
import {
    CareLogManagementApi,
    Configuration,
    CareLogDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CareLogManagementApi(configuration);

let careLogDto: CareLogDto; //careLogDto

const { status, data } = await apiInstance.addCareLogUsingPOST(
    careLogDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **careLogDto** | **CareLogDto**| careLogDto | |


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

# **getCareLogDetailUsingGET**
> R getCareLogDetailUsingGET()


### Example

```typescript
import {
    CareLogManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CareLogManagementApi(configuration);

let logId: number; //logId (default to undefined)

const { status, data } = await apiInstance.getCareLogDetailUsingGET(
    logId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **logId** | [**number**] | logId | defaults to undefined|


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

# **getPetListByStoreIdUsingGET**
> R getPetListByStoreIdUsingGET()


### Example

```typescript
import {
    CareLogManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CareLogManagementApi(configuration);

let storeId: number; //storeId (default to undefined)
let isUploaded: boolean; //isUploaded (optional) (default to undefined)

const { status, data } = await apiInstance.getPetListByStoreIdUsingGET(
    storeId,
    isUploaded
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**number**] | storeId | defaults to undefined|
| **isUploaded** | [**boolean**] | isUploaded | (optional) defaults to undefined|


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

# **getPetListByUserIdUsingGET**
> R getPetListByUserIdUsingGET()


### Example

```typescript
import {
    CareLogManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CareLogManagementApi(configuration);

let userId: number; //userId (default to undefined)

const { status, data } = await apiInstance.getPetListByUserIdUsingGET(
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

