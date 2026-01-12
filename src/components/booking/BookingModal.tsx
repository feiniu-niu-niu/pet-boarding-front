import { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { getCurrentUserDetail, type PetInfo, getAvatarUrl, getServiceItem, type ServiceItem, type PriceInfo } from "../../services/api";
import type { UserInfo } from "../../utils/auth";
import { isSuccess } from "../../utils/response";
import { calculatePrice, type PriceCalculationResult } from "../../utils/price";
import PetEditModal from "../pet/PetEditModal";
import "./bookingModal.scss";

const { TextArea } = Input;

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  storeId: number;
  storeName?: string;
  prices?: PriceInfo[]; // 门店价格列表
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  onSuccess,
  storeId,
  storeName,
  prices = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [petList, setPetList] = useState<PetInfo[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetInfo | null>(null);
  const [loadingPets, setLoadingPets] = useState(false);
  const [petSelectModalOpen, setPetSelectModalOpen] = useState(false);
  const [petEditModalOpen, setPetEditModalOpen] = useState(false);
  const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceQuantities, setServiceQuantities] = useState<Record<number, number>>({});
  const [priceResult, setPriceResult] = useState<PriceCalculationResult | null>(null);

  // 加载宠物列表
  const loadPetList = useCallback(async () => {
    setLoadingPets(true);
    try {
      const result = await getCurrentUserDetail();
      if (isSuccess(result.code)) {
        const userData = result.data as UserInfo;
        const pets = userData?.petList || [];
        setPetList(pets);
      }
    } catch (error: any) {
      console.error("加载宠物列表失败:", error);
      message.error("加载宠物列表失败，请稍后重试");
    } finally {
      setLoadingPets(false);
    }
  }, []);

  // 加载服务列表
  const loadServiceList = useCallback(async () => {
    if (!storeId) {
      return;
    }
    setLoadingServices(true);
    try {
      const services = await getServiceItem(storeId);
      setServiceList(services);
    } catch (error: any) {
      console.error("加载服务列表失败:", error);
      message.error("加载服务列表失败，请稍后重试");
      setServiceList([]);
    } finally {
      setLoadingServices(false);
    }
  }, [storeId]);

  // 加载用户宠物列表和服务列表
  useEffect(() => {
    if (open) {
      loadPetList();
      loadServiceList();
    }
  }, [open, loadPetList, loadServiceList]);

  // 监听表单字段变化，实时计算价格
  const petType = Form.useWatch("petType", form);
  const petWeight = Form.useWatch("petWeight", form);
  const startTime = Form.useWatch("startTime", form);
  const endTime = Form.useWatch("endTime", form);

  // 计算价格
  useEffect(() => {
    if (petType && petWeight !== undefined && startTime && endTime) {
      const result = calculatePrice({
        prices,
        petType,
        petWeight,
        startTime,
        endTime,
        serviceQuantities,
        serviceList,
      });
      setPriceResult(result);
    } else {
      setPriceResult(null);
    }
  }, [petType, petWeight, startTime, endTime, serviceQuantities, serviceList, prices]);

  // 处理新增宠物成功
  const handlePetAddSuccess = async () => {
    // 关闭新增宠物弹窗
    setPetEditModalOpen(false);
    // 重新加载宠物列表
    await loadPetList();
  };

  // 处理宠物选择（从下拉框）
  const handlePetSelect = (petId: number) => {
    const pet = petList.find((p) => p.petId === petId);
    if (pet) {
      setSelectedPet(pet);
      // 自动填充宠物信息
      form.setFieldsValue({
        petId: pet.petId,
        petName: pet.name || "",
        petType: pet.type || "",
        petAge: pet.age || undefined,
        petWeight: pet.weight || undefined,
        specialHabits: pet.specialHabits || "",
        petBreed: pet.breed || "",
        medicalHistory: pet.medicalHistory || "",
        vaccinationInfo: pet.vaccinationInfo || "",
      });
    }
  };

  // 处理从弹窗选择宠物
  const handlePetSelectFromModal = (pet: PetInfo) => {
    setSelectedPet(pet);
    // 自动填充宠物信息
    form.setFieldsValue({
      petId: pet.petId,
      petName: pet.name || "",
      petType: pet.type || "",
      petAge: pet.age || undefined,
      petWeight: pet.weight || undefined,
      specialHabits: pet.specialHabits || "",
      petBreed: pet.breed || "",
      medicalHistory: pet.medicalHistory || "",
      vaccinationInfo: pet.vaccinationInfo || "",
    });
    // 关闭宠物选择弹窗
    setPetSelectModalOpen(false);
    message.success(`已选择宠物：${pet.name || "未命名"}`);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证开始时间不能早于当前时间
      if (values.startTime && values.startTime.isBefore(dayjs())) {
        message.error("开始时间不能早于当前时间");
        return;
      }

      setLoading(true);
      
      // TODO: 调用预约 API
      // 这里先模拟提交
      // 构建服务项列表（只包含数量大于0的）
      const selectedServices = Object.entries(serviceQuantities)
        .filter(([, quantity]) => quantity && quantity > 0)
        .map(([serviceId, quantity]) => ({
          serviceId: Number(serviceId),
          quantity: quantity,
        }));

      console.log("预约信息:", {
        storeId,
        storeName,
        petId: values.petId,
        petName: values.petName,
        petType: values.petType,
        petAge: values.petAge,
        petWeight: values.petWeight,
        specialHabits: values.specialHabits,
        petBreed: values.petBreed,
        medicalHistory: values.medicalHistory,
        vaccinationInfo: values.vaccinationInfo,
        specialRequirements: selectedServices,
        startTime: values.startTime?.format("YYYY-MM-DD HH:mm:ss"),
        endTime: values.endTime?.format("YYYY-MM-DD HH:mm:ss"),
      });

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("预约成功！");
      form.resetFields();
      setSelectedPet(null);
      setServiceQuantities({});
      onSuccess?.();
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      console.error("提交预约失败:", error);
      message.error(error?.message || "提交预约失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理关闭
  const handleClose = () => {
    form.resetFields();
    setSelectedPet(null);
    setServiceQuantities({});
    onClose();
  };

  return (
    <Modal
      title="预约下单"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
      className="booking-modal"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        className="booking-form"
      >
        {/* 新增宠物按钮 */}
        <div className="booking-form-header">
          <Button
            type="primary"
            onClick={() => {
              setPetEditModalOpen(true);
            }}
          >
            新增宠物
          </Button>
        </div>

        {/* 宠物选择 */}
        <Form.Item
          label="选择宠物"
          name="petId"
          rules={[{ required: true, message: "请选择宠物" }]}
        >
          <Select
            placeholder="请选择宠物"
            onChange={handlePetSelect}
            loading={loadingPets}
            disabled={petList.length === 0}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={petList.map((pet) => ({
              value: pet.petId,
              label: `${pet.name || "未命名"} (${pet.type || "未知类型"})`,
            }))}
          />
        </Form.Item>

        {/* 宠物信息 - 第一行 */}
        <div className="form-row">
          <Form.Item
            label="宠物名称"
            name="petName"
            rules={[{ required: true, message: "请输入宠物名称" }]}
            className="form-item-half"
          >
            <Input placeholder="请输入内容" />
          </Form.Item>

          <Form.Item
            label="特殊习性"
            name="specialHabits"
            className="form-item-half"
          >
            <Input placeholder="请输入内容" />
          </Form.Item>
        </div>

        {/* 宠物信息 - 第二行 */}
        <div className="form-row">
          <Form.Item
            label="宠物类型"
            name="petType"
            rules={[{ required: true, message: "请输入宠物类型" }]}
            className="form-item-half"
          >
            <Input placeholder="请输入内容" />
          </Form.Item>

          <Form.Item
            label="宠物品种"
            name="petBreed"
            className="form-item-half"
          >
            <Input placeholder="请输入内容" />
          </Form.Item>
        </div>

        {/* 宠物信息 - 第三行 */}
        <div className="form-row">
          <Form.Item
            label="宠物年龄"
            name="petAge"
            className="form-item-half"
          >
            <InputNumber
              placeholder="请输入内容"
              min={0}
              max={50}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="宠物体重"
            name="petWeight"
            rules={[{ required: true, message: "请输入宠物体重" }]}
            className="form-item-half"
          >
            <InputNumber
              placeholder="请输入体重（kg）"
              min={0}
              max={200}
              precision={2}
              style={{ width: "100%" }}
              addonAfter="kg"
            />
          </Form.Item>
        </div>

        {/* 宠物信息 - 第四行 */}
        <div className="form-row">
          <Form.Item
            label="过往病史"
            name="medicalHistory"
            className="form-item-half"
          >
            <Input placeholder="请输入内容" />
          </Form.Item>
        </div>

        {/* 疫苗接种情况 */}
        <Form.Item label="疫苗接种情况" name="vaccinationInfo">
          <TextArea
            placeholder="请输入内容"
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* 特殊需求 */}
        <Form.Item label="特殊需求">
          {loadingServices ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
            </div>
          ) : serviceList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
              暂无服务项目
            </div>
          ) : (
            <div className="service-list-container">
              {serviceList.map((service) => (
                <div key={service.serviceId} className="service-item-row">
                  <div className="service-item-info">
                    <div className="service-item-name">
                      {service.serviceName || "未命名服务"}
                    </div>
                    {service.description && (
                      <div className="service-item-desc">{service.description}</div>
                    )}
                    {service.price !== undefined && (
                      <div className="service-item-price">¥{service.price}</div>
                    )}
                  </div>
                  <div className="service-item-quantity">
                    <InputNumber
                      min={0}
                      max={999}
                      precision={0}
                      placeholder="数量"
                      value={serviceQuantities[service.serviceId || 0]}
                      onChange={(value) => {
                        setServiceQuantities((prev) => ({
                          ...prev,
                          [service.serviceId || 0]: value || 0,
                        }));
                      }}
                      style={{ width: "120px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Form.Item>

        {/* 时间选择 */}
        <div className="form-row">
          <Form.Item
            label="开始时间"
            name="startTime"
            rules={[{ required: true, message: "请选择开始时间" }]}
            className="form-item-half"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择开始时间"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                if (!current) return false;
                return current < dayjs().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item
            label="结束时间"
            name="endTime"
            rules={[
              { required: true, message: "请选择结束时间" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue("startTime");
                  if (!value || !startTime) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(startTime) || value.isSame(startTime)) {
                    return Promise.reject(new Error("结束时间必须晚于开始时间"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            className="form-item-half"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择结束时间"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                if (!current) return false;
                const startTime = form.getFieldValue("startTime");
                if (startTime) {
                  return current < startTime.startOf("day");
                }
                return current < dayjs().startOf("day");
              }}
            />
          </Form.Item>
        </div>

        {/* 价格展示 */}
        {priceResult && (
          <div className="price-summary">
            <div className="price-summary-title">费用明细</div>
            <div className="price-summary-content">
              {priceResult.days > 0 && priceResult.pricePerDay > 0 && (
                <div className="price-item">
                  <span className="price-label">住宿费用：</span>
                  <span className="price-value">
                    ¥{priceResult.pricePerDay}/天 × {priceResult.days}天 = ¥{priceResult.basePrice.toFixed(2)}
                  </span>
                </div>
              )}
              {priceResult.servicePrice > 0 && (
                <div className="price-item">
                  <span className="price-label">服务费用：</span>
                  <span className="price-value">¥{priceResult.servicePrice.toFixed(2)}</span>
                </div>
              )}
              <div className="price-total">
                <span className="price-label">总计：</span>
                <span className="price-value">¥{priceResult.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="booking-form-footer">
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            确定
          </Button>
        </div>
      </Form>

      {/* 宠物选择弹窗 */}
      <Modal
        title="选择宠物"
        open={petSelectModalOpen}
        onCancel={() => setPetSelectModalOpen(false)}
        footer={null}
        width={600}
        className="pet-select-modal"
      >
        {loadingPets ? (
          <div className="pet-select-loading">
            <Spin size="large" />
          </div>
        ) : petList.length === 0 ? (
          <Empty description="您还没有添加宠物，请先添加宠物" />
        ) : (
          <div className="pet-select-list">
            {petList.map((pet) => (
              <div
                key={pet.petId}
                className={`pet-select-item ${
                  selectedPet?.petId === pet.petId ? "selected" : ""
                }`}
                onClick={() => handlePetSelectFromModal(pet)}
              >
                <div className="pet-select-avatar">
                  <img
                    src={
                      pet.avatarUrl
                        ? getAvatarUrl(pet.avatarUrl, "pet")
                        : new URL("../../img/defult.png", import.meta.url).href
                    }
                    alt={pet.name || "宠物"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = new URL(
                        "../../img/defult.png",
                        import.meta.url
                      ).href;
                    }}
                  />
                </div>
                <div className="pet-select-info">
                  <div className="pet-select-name">
                    {pet.name || "未命名"}
                  </div>
                  <div className="pet-select-details">
                    {pet.type && <span className="pet-detail-tag">{pet.type}</span>}
                    {pet.breed && <span className="pet-detail-tag">{pet.breed}</span>}
                    {pet.age !== undefined && (
                      <span className="pet-detail-tag">{pet.age} 岁</span>
                    )}
                  </div>
                </div>
                {selectedPet?.petId === pet.petId && (
                  <div className="pet-select-check">✓</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* 新增宠物弹窗 */}
      <PetEditModal
        open={petEditModalOpen}
        onClose={() => setPetEditModalOpen(false)}
        onSuccess={handlePetAddSuccess}
      />
    </Modal>
  );
};

export default BookingModal;

