import { useState, useEffect } from "react";
import { message, Modal, Form, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { getUserInfo, setUserInfo, type UserInfo } from "../utils/auth";
import { getCurrentUserDetail, deletePet, updateCurrentUser, uploadUserAvatar, getAvatarUrl, type PetInfo, type StoreInfo } from "../services/api";
import { isSuccess } from "../utils/response";
import Header from "../components/Header";
import PetEditModal from "../components/pet/PetEditModal";
import AssociateStoreModal from "../components/store/AssociateStoreModal";
import "./profile.scss";

// 默认头像路径
const DEFAULT_AVATAR = new URL("../img/defult.png", import.meta.url).href;

// 默认宠物头像
const DEFAULT_PET_AVATAR = new URL("../img/defult.png", import.meta.url).href;

// 默认门店图片
const DEFAULT_STORE_AVATAR = new URL("../img/defult.png", import.meta.url).href;


/**
 * 简介页面
 */
const Profile: React.FC = () => {
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(getUserInfo());
  const [loading, setLoading] = useState(false);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetInfo | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm] = Form.useForm();
  const [userAvatarFileList, setUserAvatarFileList] = useState<UploadFile[]>([]);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);


 

  // 组件挂载时获取最新用户详情
  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        const result = await getCurrentUserDetail();
        if (isSuccess(result.code)) {
          const userData = result.data as UserInfo;
          // 更新用户信息到 localStorage 和 state
          setUserInfo(userData);
          setUserInfoState(userData);

          console.log("获取用户详情成功:", userData);

          // 直接从用户数据中获取门店信息
          if ((userData as any).store) {
            setStoreInfo((userData as any).store);
          } else {
            setStoreInfo(null);
          }
        } else {
          message.error(result.msg || "获取用户详情失败");
        }
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "获取用户详情失败，请稍后重试";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, []);

  // 处理添加宠物
  const handleAddPet = () => {
    setEditingPet(null);
    setPetModalOpen(true);
  };

  // 处理编辑宠物
  const handleEditPet = (petId?: number) => {
    if (!petId || !userInfo?.petList) return;
    
    const pet = userInfo.petList.find((p: PetInfo) => p.petId === petId);
    if (pet) {
      setEditingPet(pet);
      setPetModalOpen(true);
    }
  };

  // 宠物操作成功后的回调
  const handlePetSuccess = () => {
    // 重新获取用户详情以更新宠物列表
    const fetchUserDetail = async () => {
      try {
        const result = await getCurrentUserDetail();
        if (isSuccess(result.code)) {
          const userData = result.data as UserInfo;
          setUserInfo(userData);
          setUserInfoState(userData);
        }
      } catch (error: any) {
        console.error("获取用户详情失败:", error);
      }
    };
    fetchUserDetail();
  };

  // 处理编辑用户信息
  const handleEditUser = () => {
    if (userInfo) {
      // 填充表单数据
      userForm.setFieldsValue({
        username: userInfo.username || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        avatarUrl: userInfo.avatarUrl || "",
      });
      
      // 设置头像文件列表
      if (userInfo.avatarUrl) {
        setUserAvatarFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: getAvatarUrl(userInfo.avatarUrl, 'user'), // 使用完整 URL 显示
          },
        ]);
      } else {
        setUserAvatarFileList([]);
      }
      
      setUserModalOpen(true);
    }
  };

  // 处理用户信息提交
  const handleUserSubmit = async () => {
    try {
      const values = await userForm.validateFields();
      setLoading(true);

      // 构建更新数据，头像URL已经在选择头像时上传并获取，直接使用表单中的值
      const updateData: any = {
        username: values.username || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || undefined,
      };

      // 如果填写了新密码，则必须填写原密码
      if (values.password && values.password.trim() !== "") {
        if (!values.oldPassword || values.oldPassword.trim() === "") {
          message.error("修改密码需要填写原密码");
          setLoading(false);
          return;
        }
        updateData.oldPassword = values.oldPassword;
        updateData.newPassword = values.password; // 使用 newPassword 字段
      }

      const result = await updateCurrentUser(updateData);

      if (isSuccess(result.code)) {
        message.success("用户信息更新成功");
        // 重新获取用户详情以更新用户信息
        const fetchUserDetail = async () => {
          try {
            const result = await getCurrentUserDetail();
            if (isSuccess(result.code)) {
              const userData = result.data as UserInfo;
              setUserInfo(userData);
              setUserInfoState(userData);
            }
          } catch (error: any) {
            console.error("获取用户详情失败:", error);
          }
        };
        fetchUserDetail();
        setUserModalOpen(false);
      } else {
        message.error(result.msg || "更新用户信息失败");
      }
    } catch (error: any) {
      console.error("更新用户信息失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "更新用户信息失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 处理关联门店
  const handleAssociateStore = () => {
    setStoreModalOpen(true);
  };

  // 关联门店成功后的回调
  const handleStoreAssociateSuccess = () => {
    // 重新获取用户详情以更新门店信息
    const fetchUserDetail = async () => {
      try {
        const result = await getCurrentUserDetail();
        if (isSuccess(result.code)) {
          const userData = result.data as UserInfo;
          setUserInfo(userData);
          setUserInfoState(userData);
          
          // 直接从用户数据中获取门店信息
          if ((userData as any).store) {
            setStoreInfo((userData as any).store);
          } else {
            setStoreInfo(null);
          }
        }
      } catch (error: any) {
        console.error("获取用户详情失败:", error);
      }
    };
    fetchUserDetail();
  };


  // 处理删除宠物
  const handleDeletePet = (petId?: number) => {
    if (!petId) {
      message.warning("宠物ID不存在");
      return;
    }

    // 查找宠物信息用于确认对话框
    const pet = userInfo?.petList?.find((p: PetInfo) => p.petId === petId);
    const petName = pet?.name || "该宠物";

    Modal.confirm({
      title: "确认删除",
      content: `确定要删除 ${petName} 吗？此操作不可恢复。`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          const result = await deletePet(petId);
          
          if (isSuccess(result.code)) {
            message.success("删除成功");
            // 重新获取用户详情以更新宠物列表
            const fetchUserDetail = async () => {
              try {
                const result = await getCurrentUserDetail();
                if (isSuccess(result.code)) {
                  const userData = result.data as UserInfo;
                  setUserInfo(userData);
                  setUserInfoState(userData);
                }
              } catch (error: any) {
                console.error("获取用户详情失败:", error);
              }
            };
            fetchUserDetail();
          } else {
            message.error(result.msg || "删除失败");
          }
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.msg ||
            error?.response?.data?.message ||
            error?.message ||
            "删除宠物失败，请稍后重试";
          message.error(errorMsg);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="profile-container">
      {/* 顶部导航栏 - 使用公共 Header 组件 */}
      <Header />

      {/* 简介内容区域 */}
      <div className="profile-content">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p>加载中...</p>
          </div>
        ) : (
          <div className="profile-wrapper">
            {/* 左侧：头像 */}
            <div className="profile-left">
              <div className="profile-avatar-container">
                <img
                  src={userInfo?.avatarUrl ? getAvatarUrl(userInfo.avatarUrl, 'user') : DEFAULT_AVATAR}
                  alt="用户头像"
                  className="profile-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <button className="pet-edit-button" onClick={handleEditUser}>
                编辑信息
              </button>
            </div>

            {/* 分隔线 */}
            <div className="profile-divider"></div>

            {/* 右侧：用户信息和操作按钮 */}
            <div className="profile-right">
              <div className="profile-info">
                <h1 className="profile-greeting">
                  嘿, 我是 {userInfo?.username || "用户"}
                </h1>
                <p className="profile-email">
                  {userInfo?.email || "user@example.com"}
                </p>
              </div>

              {userInfo?.userType === 1 && <div className="profile-actions">
                {/* 宠物列表标题 */}
                <div className="pets-section-header">
                  <h2 className="pets-title">我的宠物</h2>
                  <button className="add-pet-button" onClick={handleAddPet}>
                    + 添加宠物
                  </button>
                </div>

                {/* 宠物卡片列表 */}
                <div className="pets-grid">
                  {userInfo?.petList && Array.isArray(userInfo.petList) && userInfo.petList.length > 0 ? (
                    userInfo.petList.map((pet: PetInfo) => (
                      <div key={pet.petId} className="pet-card">
                        <div className="pet-card-header">
                          <img
                            src={pet.avatarUrl ? getAvatarUrl(pet.avatarUrl, 'pet') : DEFAULT_PET_AVATAR}
                            alt={pet.name || "宠物"}
                            className="pet-avatar"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_PET_AVATAR;
                            }}
                          />
                          <div className="pet-basic-info">
                            <h3 className="pet-name">{pet.name || "未命名"}</h3>
                            <p className="pet-type-breed">
                              {pet.type || ""} · {pet.breed || ""}
                            </p>
                          </div>
                        </div>

                        <div className="pet-card-body">
                          <div className="pet-info-row">
                            <span className="pet-info-label">年龄:</span>
                            <span className="pet-info-value">{pet.age !== undefined ? `${pet.age} 岁` : "未知"}</span>
                          </div>
                          <div className="pet-info-row">
                            <span className="pet-info-label">体重:</span>
                            <span className="pet-info-value">{pet.weight !== undefined ? `${pet.weight} kg` : "未知"}</span>
                          </div>
                        </div>

                        <div className="pet-card-footer">
                          <button className="pet-edit-button" onClick={() => handleDeletePet(pet.petId)}>
                            删除
                          </button>
                          <button className="pet-edit-button" onClick={() => handleEditPet(pet.petId)}>
                            编辑
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-pets-message">
                      <p>还没有添加宠物，点击上方按钮添加您的第一个宠物吧！</p>
                    </div>
                  )}
                </div>
              </div>}
              {userInfo?.userType === 2 && <div className="profile-actions">
                {/* 门店关联标题 */}
                <div className="pets-section-header">
                  <h2 className="pets-title">门店管理</h2>
                </div>
                
                {/* 门店信息展示或关联提示 */}
                {storeInfo ? (
                  <div className="store-card">
                    <div className="store-card-header">
                      <div className="store-header-left">
                        <img
                          src={(storeInfo as any).avatarUrl ? getAvatarUrl((storeInfo as any).avatarUrl, 'store') : DEFAULT_STORE_AVATAR}
                          alt={storeInfo.name || "门店"}
                          className="store-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_STORE_AVATAR;
                          }}
                        />
                        <h3 className="store-name">{storeInfo.name || "未命名门店"}</h3>
                      </div>
                      {storeInfo.isActive !== undefined && (
                        <span
                          className={`store-status ${
                            storeInfo.isActive === 1 ? "active" : "inactive"
                          }`}
                        >
                          {storeInfo.isActive === 1 ? "营业中" : "已关闭"}
                        </span>
                      )}
                    </div>
                    <div className="store-card-body">
                      <div className="store-info-row">
                        <span className="store-info-label">地址:</span>
                        <span className="store-info-value">
                          {storeInfo.fullAddress || "地址未知"}
                        </span>
                      </div>
                      {(storeInfo as any).description && (
                        <div className="store-info-row">
                          <span className="store-info-label">描述:</span>
                          <span className="store-info-value">
                            {(storeInfo as any).description}
                          </span>
                        </div>
                      )}
                      {(storeInfo as any).businessHours && (
                        <div className="store-info-row">
                          <span className="store-info-label">营业时间:</span>
                          <span className="store-info-value">
                            {(storeInfo as any).businessHours}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                <div className="store-message">
                  <div className="store-message-content">
                    <p className="store-message-text">您是门店员工，请关联您的门店以开始工作</p>
                    <button className="store-associate-button" onClick={handleAssociateStore}>
                      立即关联门店
                    </button>
                  </div>
                </div>
                )}
              </div>}
            </div>
          </div>
        )}
      </div>

      {/* 宠物编辑弹框 */}
      <PetEditModal
        open={petModalOpen}
        onClose={() => {
          setPetModalOpen(false);
          setEditingPet(null);
        }}
        onSuccess={handlePetSuccess}
        petId={editingPet?.petId}
        initialData={editingPet || undefined}
      />

      {/* 关联门店弹框 */}
      <AssociateStoreModal
        open={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        onSuccess={handleStoreAssociateSuccess}
      />

      {/* 用户信息编辑弹框 */}
      <Modal
        title="编辑用户信息"
        open={userModalOpen}
        onOk={handleUserSubmit}
        onCancel={() => {
          setUserModalOpen(false);
          userForm.resetFields();
          setUserAvatarFileList([]);
        }}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form form={userForm} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="头像" name="avatarUrl">
            <Upload
              listType="picture-card"
              fileList={userAvatarFileList}
              beforeUpload={() => false} // 阻止自动上传
              onChange={async ({ fileList, file }) => {
                // 更新文件列表
                setUserAvatarFileList(fileList);
                
                // 如果有新上传的文件，立即上传到服务器获取URL
                const currentFile = fileList.length > 0 ? fileList[0] : null;
                // 尝试从多个位置获取原始文件对象
                const originFile = currentFile?.originFileObj || 
                                 (file as any)?.originFileObj || 
                                 (file as any)?.originFile ||
                                 (currentFile as any)?.originFile;
                
                // 如果文件列表有内容且有原始文件对象，说明是新选择的文件，需要上传
                if (fileList.length > 0 && originFile && originFile instanceof File) {
                  try {
                    // 显示上传中状态
                    const uploadingFile: UploadFile = {
                      ...currentFile,
                      uid: currentFile?.uid || String(Date.now()),
                      name: currentFile?.name || originFile.name || 'avatar',
                      status: 'uploading' as const,
                    };
                    setUserAvatarFileList([uploadingFile]);
                    
                    // 上传文件
                    const uploadResult = await uploadUserAvatar(originFile);
                    
                    if (isSuccess(uploadResult.code)) {
                      // 从返回结果中获取头像URL（可能是相对路径或文件名）
                      const rawAvatarUrl = (uploadResult.data as any)?.url || 
                                          (uploadResult.data as any)?.avatarUrl || 
                                          (uploadResult.data as any)?.data ||
                                          (uploadResult.data as any);
                      
                      if (rawAvatarUrl) {
                        // 处理头像 URL，确保是完整 URL
                        const fullAvatarUrl = getAvatarUrl(rawAvatarUrl, 'user');
                        
                        // 更新文件列表，显示上传成功
                        const successFile: UploadFile = {
                          ...currentFile,
                          uid: currentFile?.uid || String(Date.now()),
                          name: currentFile?.name || originFile.name || 'avatar',
                          status: 'done' as const,
                          url: fullAvatarUrl,
                          originFileObj: undefined, // 清除原始文件对象，避免重复上传
                        };
                        setUserAvatarFileList([successFile]);
                        // 更新表单中的 avatarUrl（保存原始值，显示时再转换）
                        userForm.setFieldsValue({ avatarUrl: rawAvatarUrl });
                        message.success("头像上传成功");
                      } else {
                        message.error("头像上传成功，但未获取到头像URL");
                        setUserAvatarFileList([]);
                        userForm.setFieldsValue({ avatarUrl: "" });
                      }
                    } else {
                      message.error(uploadResult.msg || "头像上传失败");
                      setUserAvatarFileList([]);
                      userForm.setFieldsValue({ avatarUrl: "" });
                    }
                  } catch (error: any) {
                    const errorMsg =
                      error?.response?.data?.msg ||
                      error?.response?.data?.message ||
                      error?.message ||
                      "头像上传失败，请稍后重试";
                    message.error(errorMsg);
                    setUserAvatarFileList([]);
                    userForm.setFieldsValue({ avatarUrl: "" });
                  }
                } else if (fileList.length > 0) {
                  // 更新文件列表（但不触发上传，可能是编辑模式或文件状态变化）
                  setUserAvatarFileList(fileList);
                  // 如果是已有的URL（编辑模式），直接使用
                  if (fileList[0].url && !fileList[0].originFileObj) {
                    userForm.setFieldsValue({ avatarUrl: fileList[0].url });
                  }
                } else {
                  // 清空
                  setUserAvatarFileList([]);
                  userForm.setFieldsValue({ avatarUrl: "" });
                }
              }}
              onRemove={() => {
                setUserAvatarFileList([]);
                userForm.setFieldsValue({ avatarUrl: "" });
              }}
              maxCount={1}
            >
              {userAvatarFileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            label="原密码"
            name="oldPassword"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue("password");
                  // 如果填写了新密码，则原密码必须填写
                  if (password && password.trim() !== "") {
                    if (!value || value.trim() === "") {
                      return Promise.reject(new Error("修改密码需要填写原密码"));
                    }
                  }
                  // 如果新密码为空，原密码也应该为空
                  if (!password && value) {
                    return Promise.reject(new Error("未填写新密码时不需要填写原密码"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            help="修改密码时需要填写"
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="password"
            dependencies={["oldPassword", "confirmPassword"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const oldPassword = getFieldValue("oldPassword");
                  const confirmPassword = getFieldValue("confirmPassword");
                  
                  // 如果填写了新密码，则原密码必须填写
                  if (value && value.trim() !== "") {
                    if (!oldPassword || oldPassword.trim() === "") {
                      return Promise.reject(new Error("修改密码需要填写原密码"));
                    }
                    // 如果密码已填写，则长度至少为6位
                    if (value.length < 6) {
                      return Promise.reject(new Error("密码长度至少为6位"));
                    }
                  }
                  
                  // 如果确认密码已填写，则密码也必须填写
                  if (confirmPassword && !value) {
                    return Promise.reject(new Error("请先输入新密码"));
                  }
                  
                  return Promise.resolve();
                },
              }),
            ]}
            help="留空则不修改密码"
          >
            <Input.Password placeholder="请输入新密码（留空则不修改）" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue("password");
                  // 如果密码已填写，则确认密码必须填写且一致
                  if (password) {
                    if (!value) {
                      return Promise.reject(new Error("请确认密码"));
                    }
                    if (value !== password) {
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    }
                  }
                  // 如果密码为空，确认密码也应该为空
                  if (!password && value) {
                    return Promise.reject(new Error("请先输入新密码"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;

