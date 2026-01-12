# FileUploadManagementApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**uploadPetAvatarUsingPOST**](#uploadpetavatarusingpost) | **POST** /upload/pet/avatar | 上传宠物头像|
|[**uploadUserAvatarUsingPOST**](#uploaduseravatarusingpost) | **POST** /upload/user/avatar | 上传用户头像|

# **uploadPetAvatarUsingPOST**
> R uploadPetAvatarUsingPOST()


### Example

```typescript
import {
    FileUploadManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadManagementApi(configuration);

let file: File; //file (default to undefined)

const { status, data } = await apiInstance.uploadPetAvatarUsingPOST(
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] | file | defaults to undefined|


### Return type

**R**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
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

# **uploadUserAvatarUsingPOST**
> R uploadUserAvatarUsingPOST()


### Example

```typescript
import {
    FileUploadManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadManagementApi(configuration);

let file: File; //file (default to undefined)

const { status, data } = await apiInstance.uploadUserAvatarUsingPOST(
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] | file | defaults to undefined|


### Return type

**R**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
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

