import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { addPet, updatePet, uploadPetAvatar, savePetWithAvatar, getAvatarUrl, type PetInfo } from "../../services/api";
import { isSuccess } from "../../utils/response";
import "./petEditModal.scss";

const { TextArea } = Input;

interface PetEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  petId?: number; // 如果有 petId，则是编辑模式；否则是新增模式
  initialData?: PetInfo; // 初始数据（编辑时使用）
}

const PetEditModal: React.FC<PetEditModalProps> = ({
  open,
  onClose,
  onSuccess,
  petId,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditMode = !!petId; // 判断是编辑还是新增模式

  // 当弹框打开或初始数据变化时，填充表单
  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        // 编辑模式：填充表单数据
        form.setFieldsValue({
          name: initialData.name || "",
          type: initialData.type || undefined,
          breed: initialData.breed || "",
          age: initialData.age || undefined,
          weight: initialData.weight || undefined,
          specialHabits: initialData.specialHabits || "",
          medicalHistory: initialData.medicalHistory || "",
          vaccinationInfo: initialData.vaccinationInfo || "",
        });

        // 如果有头像，设置文件列表
        if (initialData.avatarUrl) {
          setFileList([
            {
              uid: "-1",
              name: "avatar.png",
              status: "done",
              url: getAvatarUrl(initialData.avatarUrl, 'pet'), // 使用完整 URL 显示
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        // 新增模式：重置表单
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, isEditMode, initialData, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 获取当前用户ID
      const userInfoStr = localStorage.getItem('userInfo');


    //   console.log('userInfoStr======', userInfoStr);
      if (!userInfoStr) {
        message.error("用户信息不存在，请重新登录");
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo?.userId;

    //   console.log('userId======', userId);
      if (!userId) {
        message.error("用户不存在，请重新登录");
        return;
      }

      // 准备提交的数据
      const petData: PetInfo = {
        userId,
        name: values.name || undefined,
        type: values.type || undefined,
        breed: values.breed || undefined,
        age: values.age || undefined,
        weight: values.weight || undefined,
        specialHabits: values.specialHabits || undefined,
        medicalHistory: values.medicalHistory || undefined,
        vaccinationInfo: values.vaccinationInfo || undefined,
        avatarUrl: fileList.length > 0 && fileList[0].url && !fileList[0].originFileObj ? fileList[0].url : undefined,
        ...(isEditMode && petId ? { petId } : {}),
      } as PetInfo;

      // 获取上传的文件
      const uploadedFile = fileList.find(file => file.originFileObj);
      const avatarFile = uploadedFile?.originFileObj;

      let result: any;
      
      // 如果有新上传的头像文件，使用 savePetWithAvatar 接口
      if (avatarFile) {
        result = await savePetWithAvatar(petData, avatarFile);
      } else {
        // 没有新上传的文件，使用原来的接口
        if (isEditMode && petId) {
          // 编辑模式：更新宠物信息
          result = await updatePet(petId, petData);
        } else {
          // 新增模式：添加宠物
          result = await addPet(petData);
        }
      }

      if (isSuccess(result.code)) {
        message.success(isEditMode ? "宠物信息更新成功" : "宠物添加成功");
        onSuccess?.();
        handleClose();
      } else {
        message.error(result.msg || (isEditMode ? "更新宠物失败" : "添加宠物失败"));
      }
    } catch (error: any) {
      console.error("保存宠物信息失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        (isEditMode ? "更新宠物失败，请稍后重试" : "添加宠物失败，请稍后重试");
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 关闭弹框
  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  // 头像上传前的处理
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件！");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("图片大小不能超过 2MB！");
      return false;
    }
    return false; // 阻止自动上传，我们稍后手动处理
  };

  // 处理头像上传
  const handleChange = (info: any) => {
    setFileList(info.fileList);
  };

  return (
    <Modal
      title={isEditMode ? "编辑宠物信息" : "添加宠物"}
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        className="pet-edit-form"
      >
        {/* 宠物昵称 */}
        <Form.Item
          label="宠物昵称"
          name="name"
          rules={[{ required: true, message: "请输入宠物昵称" }]}
        >
          <Input
            placeholder="请输入宠物昵称"
            maxLength={50}
            autoComplete="off"
          />
        </Form.Item>

        {/* 宠物类型 */}
        <Form.Item
          label="宠物类型"
          name="type"
          rules={[{ required: true, message: "请输入宠物类型" }]}
        >
          <Input
            placeholder="请输入宠物类型，如：狗、猫、兔、鸟等"
            maxLength={20}
            autoComplete="off"
          />
        </Form.Item>

        {/* 品种 */}
        <Form.Item label="品种" name="breed">
          <Input placeholder="请输入品种" maxLength={50} autoComplete="off" />
        </Form.Item>

        {/* 年龄和体重 */}
        <div className="form-row">
          <Form.Item label="年龄" name="age" className="form-item-half">
            <InputNumber
              placeholder="请输入年龄"
              min={0}
              max={50}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="体重 (kg)" name="weight" className="form-item-half">
            <InputNumber
              placeholder="请输入体重"
              min={0}
              max={500}
              precision={1}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        {/* 宠物头像 */}
        <Form.Item label="宠物头像" name="avatarUrl">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传头像</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* 疫苗接种情况 */}
        <Form.Item label="疫苗接种情况" name="vaccinationInfo">
          <TextArea
            placeholder="请描述宠物的疫苗接种情况"
            rows={3}
            maxLength={500}
            showCount
            autoComplete="off"
          />
        </Form.Item>

        {/* 过往病史 */}
        <Form.Item label="过往病史" name="medicalHistory">
          <TextArea
            placeholder="请描述宠物的过往病史"
            rows={3}
            maxLength={500}
            showCount
            autoComplete="off"
          />
        </Form.Item>

        {/* 特殊习性 */}
        <Form.Item label="特殊习性" name="specialHabits">
          <TextArea
            placeholder='请描述宠物的特殊习性，如"怕生"、"不爱吃某种食物"等'
            rows={3}
            maxLength={500}
            showCount
            autoComplete="off"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PetEditModal;

