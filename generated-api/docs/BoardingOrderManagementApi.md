# BoardingOrderManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addBoardingOrderUsingPOST**](#addboardingorderusingpost) | **POST** /boarding-order/addBoardingOrder | 创建支付订单|
|[**checkInUsingPOST**](#checkinusingpost) | **POST** /boarding-order/checkIn/{orderId} | 宠物入托（门店员工操作，更新checkinTime和订单状态为寄养中）|
|[**getOrderListByStatusUsingGET**](#getorderlistbystatususingget) | **GET** /boarding-order/boardingOrderList | 根据订单状态和用户ID获取订单列表（支付列表）|
|[**getOrderListByStoreIdUsingGET**](#getorderlistbystoreidusingget) | **GET** /boarding-order/storeOrderList | 根据门店ID获取订单列表（门店员工视角，包含宠物信息）|
|[**getOrderStatusUsingGET**](#getorderstatususingget) | **GET** /boarding-order/status/{orderId} | 查询订单状态/剩余时间|
|[**getSettlementAmountUsingGET**](#getsettlementamountusingget) | **GET** /boarding-order/settlementAmount/{orderId} | 宠物主人查看待结算订单的应付金额|
|[**getTreatmentPendingOrdersUsingGET**](#gettreatmentpendingordersusingget) | **GET** /boarding-order/treatmentPendingOrders | 查询门店需要治疗的宠物列表（可根据审批状态过滤：0-待处理，1-已同意，2-已拒绝，3-已过期，不传则返回所有状态）|
|[**ownerPickupUsingPOST**](#ownerpickupusingpost) | **POST** /boarding-order/pickup/{orderId} | 宠物主人接回，订单从寄养中变为待结算，并返回待支付金额|
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

# **checkInUsingPOST**
> R checkInUsingPOST()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let orderId: string; //orderId (default to undefined)

const { status, data } = await apiInstance.checkInUsingPOST(
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

# **getSettlementAmountUsingGET**
> R getSettlementAmountUsingGET()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let orderId: string; //orderId (default to undefined)

const { status, data } = await apiInstance.getSettlementAmountUsingGET(
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

# **getTreatmentPendingOrdersUsingGET**
> R getTreatmentPendingOrdersUsingGET()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let storeId: number; //storeId (default to undefined)
let approvalStatus: number; //approvalStatus (optional) (default to undefined)

const { status, data } = await apiInstance.getTreatmentPendingOrdersUsingGET(
    storeId,
    approvalStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**number**] | storeId | defaults to undefined|
| **approvalStatus** | [**number**] | approvalStatus | (optional) defaults to undefined|


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

# **ownerPickupUsingPOST**
> R ownerPickupUsingPOST()


### Example

```typescript
import {
    BoardingOrderManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BoardingOrderManagementApi(configuration);

let orderId: string; //orderId (default to undefined)

const { status, data } = await apiInstance.ownerPickupUsingPOST(
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

