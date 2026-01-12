# PetManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deletePetUsingDELETE**](#deletepetusingdelete) | **DELETE** /pet/deletePet | 删除宠物|
|[**savePetUsingPOST**](#savepetusingpost) | **POST** /pet/savePet | 新增/修改宠物|

# **deletePetUsingDELETE**
> R deletePetUsingDELETE()


### Example

```typescript
import {
    PetManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PetManagementApi(configuration);

let petId: number; //petId (default to undefined)

const { status, data } = await apiInstance.deletePetUsingDELETE(
    petId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **petId** | [**number**] | petId | defaults to undefined|


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
|**204** | No Content |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **savePetUsingPOST**
> R savePetUsingPOST(pet)


### Example

```typescript
import {
    PetManagementApi,
    Configuration,
    Pet
} from './api';

const configuration = new Configuration();
const apiInstance = new PetManagementApi(configuration);

let pet: Pet; //pet

const { status, data } = await apiInstance.savePetUsingPOST(
    pet
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pet** | **Pet**| pet | |


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

