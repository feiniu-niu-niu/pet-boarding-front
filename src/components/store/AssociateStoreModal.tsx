import { useState } from "react";
import { Modal, Input, Button, message, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { searchStores, associateStore, type StoreInfo } from "../../services/api";
import { isSuccess } from "../../utils/response";
import { getUserInfo, getLongitude, getLatitude } from "../../utils/auth";
import "./associateStoreModal.scss";

interface AssociateStoreModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AssociateStoreModal: React.FC<AssociateStoreModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [storeList, setStoreList] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [associating, setAssociating] = useState<number | null>(null);

  // 搜索门店
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      message.warning("请输入搜索关键词");
      return;
    }

    setLoading(true);
    try {
      // 获取用户当前位置的经纬度
      const longitude = getLongitude();
      const latitude = getLatitude();
      
      // 调用封装好的搜索方法，传入关键词和经纬度
      const stores = await searchStores(searchKeyword.trim(), {
        longitude: longitude || undefined,
        latitude: latitude || undefined,
      });
      
      setStoreList(stores);
      
      if (stores.length === 0) {
        message.info("未找到相关门店");
      }
    } catch (error: any) {
      console.error("搜索门店失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "搜索门店失败，请稍后重试";
      message.error(errorMsg);
      setStoreList([]);
    } finally {
      setLoading(false);
    }
  };

  // 关联门店
  const handleAssociate = async (storeId?: number) => {
    if (!storeId) {
      message.warning("门店ID不存在");
      return;
    }

    // 获取当前用户信息
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.userId) {
      message.error("用户信息不存在，请重新登录");
      return;
    }

    console.log("开始关联门店:", { storeId, userId: userInfo.userId });
    setAssociating(storeId);
    
    try {
      // 调用关联门店 API
      const result = await associateStore(storeId, userInfo.userId);
      console.log("关联门店响应:", result);
      
      if (isSuccess(result.code)) {
        message.success(result.msg || "关联门店成功");
        // 关闭弹框并触发成功回调
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.msg || "关联门店失败");
      }
    } catch (error: any) {
      console.error("关联门店失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "关联门店失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setAssociating(null);
    }
  };

  // 关闭弹框
  const handleClose = () => {
    setSearchKeyword("");
    setStoreList([]);
    onClose();
  };

  // 处理回车搜索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Modal
      title="关联门店"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      className="associate-store-modal"
    >
      <div className="associate-store-content">
        {/* 搜索区域 */}
        <div className="search-section">
          <Input
            placeholder="请输入门店名称或地址进行搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            prefix={<SearchOutlined />}
            allowClear
            size="large"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            size="large"
            style={{ marginTop: 12 }}
          >
            搜索
          </Button>
        </div>

        {/* 搜索结果区域 */}
        <div className="results-section">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>搜索中...</p>
            </div>
          ) : storeList.length > 0 ? (
            <div className="store-list">
              {storeList.map((store) => (
                <div key={store.storeId} className="store-item">
                  <div className="store-info">
                    <h3 className="store-name">{store.name || "未命名门店"}</h3>
                    <p className="store-address">
                      {store.fullAddress || "地址未知"}
                    </p>
                    {store.isActive !== undefined && (
                      <span
                        className={`store-status ${
                          store.isActive === 1 ? "active" : "inactive"
                        }`}
                      >
                        {store.isActive === 1 ? "营业中" : "已关闭"}
                      </span>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={() => handleAssociate(store.storeId)}
                    loading={associating === store.storeId}
                    disabled={associating !== null}
                  >
                    {associating === store.storeId ? "关联中..." : "关联"}
                  </Button>
                </div>
              ))}
            </div>
          ) : searchKeyword ? (
            <Empty
              description="未找到相关门店"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="empty-state">
              <p>请输入门店名称或地址进行搜索</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AssociateStoreModal;

