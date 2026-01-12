# UserManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**associateStoreUsingPOST**](#associatestoreusingpost) | **POST** /user/associateStore | 关联门店|
|[**getUserDetailUsingPOST**](#getuserdetailusingpost) | **POST** /user/getUserDetail/{userId} | 获取用户详情|
|[**loginUsingPOST**](#loginusingpost) | **POST** /user/login | 登录|
|[**registerUsingPOST**](#registerusingpost) | **POST** /user/register | 注册|
|[**updateUserUsingPOST**](#updateuserusingpost) | **POST** /user/updateUser | 修改用户|

# **associateStoreUsingPOST**
> R associateStoreUsingPOST()


### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let storeId: number; //storeId (default to undefined)
let userId: number; //userId (default to undefined)

const { status, data } = await apiInstance.associateStoreUsingPOST(
    storeId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **storeId** | [**number**] | storeId | defaults to undefined|
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
|**201** | Created |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserDetailUsingPOST**
> R getUserDetailUsingPOST()


### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let userId: number; //userId (default to undefined)

const { status, data } = await apiInstance.getUserDetailUsingPOST(
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
|**201** | Created |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loginUsingPOST**
> R loginUsingPOST()


### Example

```typescript
import {
    UserManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let password: string; //password (default to undefined)
let username: string; //username (default to undefined)

const { status, data } = await apiInstance.loginUsingPOST(
    password,
    username
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **password** | [**string**] | password | defaults to undefined|
| **username** | [**string**] | username | defaults to undefined|


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

# **registerUsingPOST**
> R registerUsingPOST(user)


### Example

```typescript
import {
    UserManagementApi,
    Configuration,
    User
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let user: User; //user

const { status, data } = await apiInstance.registerUsingPOST(
    user
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | **User**| user | |


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

# **updateUserUsingPOST**
> R updateUserUsingPOST(updateUserDto)


### Example

```typescript
import {
    UserManagementApi,
    Configuration,
    UpdateUserDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserManagementApi(configuration);

let updateUserDto: UpdateUserDto; //updateUserDto

const { status, data } = await apiInstance.updateUserUsingPOST(
    updateUserDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserDto** | **UpdateUserDto**| updateUserDto | |


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

