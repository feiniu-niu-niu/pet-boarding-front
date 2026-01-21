# ReviewManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addReviewUsingPOST**](#addreviewusingpost) | **POST** /review/add | 新增评价|
|[**getReviewListByStoreIdUsingGET**](#getreviewlistbystoreidusingget) | **GET** /review/list/{storeId} | 根据门店ID获取评论列表|
|[**getReviewOrdersUsingGET**](#getreviewordersusingget) | **GET** /review/orders/{userId} | 查询评价订单列表（待评价或已评价）|

# **addReviewUsingPOST**
> R addReviewUsingPOST(dto)


### Example

```typescript
import {
    ReviewManagementApi,
    Configuration,
    AddReviewDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewManagementApi(configuration);

let dto: AddReviewDto; //dto

const { status, data } = await apiInstance.addReviewUsingPOST(
    dto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dto** | **AddReviewDto**| dto | |


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

# **getReviewListByStoreIdUsingGET**
> R getReviewListByStoreIdUsingGET()


### Example

```typescript
import {
    ReviewManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewManagementApi(configuration);

let storeId: number; //storeId (default to undefined)

const { status, data } = await apiInstance.getReviewListByStoreIdUsingGET(
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
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getReviewOrdersUsingGET**
> R getReviewOrdersUsingGET()


### Example

```typescript
import {
    ReviewManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReviewManagementApi(configuration);

let userId: number; //userId (default to undefined)
let reviewed: boolean; //reviewed (optional) (default to undefined)

const { status, data } = await apiInstance.getReviewOrdersUsingGET(
    userId,
    reviewed
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] | userId | defaults to undefined|
| **reviewed** | [**boolean**] | reviewed | (optional) defaults to undefined|


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

