# BoardingOrderManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addBoardingOrderUsingPOST**](#addboardingorderusingpost) | **POST** /boarding-order/addBoardingOrder | 创建支付订单|
|[**getOrderListByStatusUsingGET**](#getorderlistbystatususingget) | **GET** /boarding-order/boardingOrderList | 根据订单状态和用户ID获取订单列表（支付列表）|
|[**getOrderListByStoreIdUsingGET**](#getorderlistbystoreidusingget) | **GET** /boarding-order/storeOrderList | 根据门店ID获取订单列表（门店员工视角，包含宠物信息）|
|[**getOrderStatusUsingGET**](#getorderstatususingget) | **GET** /boarding-order/status/{orderId} | 查询订单状态/剩余时间|
|[**payDepositUsingPOST**](#paydepositusingpost) | **POST** /boarding-order/payDeposit/{orderId} | 订单状态待支付-&gt;支付定金|

# **addBoardingOrderUsingPOST**
> R addBoardingOrderUsingPOST(boardingOrderDto)


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration,
    BoardingOrderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let boardingOrderDto: BoardingOrderDto; //boardingOrderDto

const { status, data } = await apiInstance.addBoardingOrderUsingPOST(
    boardingOrderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **boardingOrderDto** | **BoardingOrderDto**| boardingOrderDto | |


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

# **getOrderListByStatusUsingGET**
> R getOrderListByStatusUsingGET()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let orderStatus: number; //orderStatus (default to undefined)
let userId: number; //userId (default to undefined)

const { status, data } = await apiInstance.getOrderListByStatusUsingGET(
    orderStatus,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderStatus** | [**number**] | orderStatus | defaults to undefined|
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

# **getOrderListByStoreIdUsingGET**
> R getOrderListByStoreIdUsingGET()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let storeId: number; //storeId (default to undefined)
let orderStatus: number; //orderStatus (optional) (default to undefined)

const { status, data } = await apiInstance.getOrderListByStoreIdUsingGET(
    storeId,
    orderStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**number**] | storeId | defaults to undefined|
| **orderStatus** | [**number**] | orderStatus | (optional) defaults to undefined|


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

# **getOrderStatusUsingGET**
> R getOrderStatusUsingGET()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let orderId: string; //orderId (default to undefined)

const { status, data } = await apiInstance.getOrderStatusUsingGET(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | [**string**] | orderId | defaults to undefined|


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

# **payDepositUsingPOST**
> R payDepositUsingPOST()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let orderId: string; //orderId (default to undefined)

const { status, data } = await apiInstance.payDepositUsingPOST(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | [**string**] | orderId | defaults to undefined|


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

