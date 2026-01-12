import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin, Empty, Button } from "antd";
import Header from "../components/Header";
import { getStoreDetail, StoreInfo, getAvatarUrl } from "../services/api";
import "./storeDetail.scss";

// 默认门店头像
const DEFAULT_STORE_AVATAR = new URL("../img/defult.png", import.meta.url).href;

/**
 * 获取省市区标签数组
 */
const getAddressTags = (storeInfo: StoreInfo): string[] => {
  const tags: string[] = [];
  
  if (storeInfo.province) {
    tags.push(storeInfo.province);
  }
  
  if (storeInfo.city) {
    tags.push(storeInfo.city);
  }
  
  if (storeInfo.district) {
    tags.push(storeInfo.district);
  }
  
  return tags;
};

/**
 * 门店详情页面
 */
const StoreDetail: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

  // 加载门店详情
  useEffect(() => {
    const loadStoreDetail = async () => {
      if (!storeId) {
        message.error("门店ID不存在");
        navigate("/stores");
        return;
      }

      setLoading(true);
      try {
        const store = await getStoreDetail(Number(storeId));
        setStoreInfo(store);
      } catch (error: any) {
        console.error("加载门店详情失败:", error);
        const errorMsg =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "加载门店详情失败，请稍后重试";
        message.error(errorMsg);
        // 如果加载失败，返回列表页
        setTimeout(() => {
          navigate("/stores");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadStoreDetail();
  }, [storeId, navigate]);

  // 处理立即预约
  const handleBookNow = () => {
    navigate(`/stores/${storeId}/booking`);
  };

  if (loading) {
    return (
      <div className="store-detail-container">
        <Header />
        <div className="store-detail-content">
          <div className="loading-container">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="store-detail-container">
        <Header />
        <div className="store-detail-content">
          <Empty description="门店不存在或已被删除" />
        </div>
      </div>
    );
  }

  const addressTags = getAddressTags(storeInfo);
  const prices = (storeInfo as any).prices || [];

  return (
    <div className="store-detail-container">
      <Header />
      <div className="store-detail-content">
        <div className="store-detail-layout">
          {/* 左侧：门店图片 */}
          <div className="store-detail-image">
            <img
              src={
                (storeInfo as any).avatarUrl
                  ? getAvatarUrl((storeInfo as any).avatarUrl, "store")
                  : DEFAULT_STORE_AVATAR
              }
              alt={storeInfo.name || "门店"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_STORE_AVATAR;
              }}
            />
          </div>

          {/* 右侧：门店信息 */}
          <div className="store-detail-info">
            <div className="store-info-header">
              <h1 className="store-detail-name">
                {storeInfo.name || "未命名门店"}
              </h1>
              {storeInfo.isActive !== undefined && (
                <span
                  className={`store-detail-status ${
                    storeInfo.isActive === 1 ? "active" : "inactive"
                  }`}
                >
                  {storeInfo.isActive === 1 ? "营业中" : "已关闭"}
                </span>
              )}
            </div>

            {(storeInfo as any).businessHours && (
              <div className="store-info-item">
                <span className="info-label">营业时间:</span>
                <span className="info-value">
                  {(storeInfo as any).businessHours}
                </span>
              </div>
            )}

            {/* 地址标签和立即预约按钮 */}
            <div className="store-address-actions">
              {addressTags.length > 0 && (
                <div className="store-address-tags">
                  {addressTags.map((tag, index) => (
                    <span key={index} className="address-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Button
                type="primary"
                size="large"
                className="book-button"
                onClick={handleBookNow}
                disabled={storeInfo.isActive !== 1}
              >
                立即预约
              </Button>
            </div>

            {/* 门店描述 */}
            {(storeInfo as any).description && (
              <div className="store-description">
                <h3 className="description-title">门店介绍</h3>
                <p className="description-content">
                  {(storeInfo as any).description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 价格条款 */}
        {prices.length > 0 && (
          <div className="price-section">
            <h2 className="price-section-title">价格说明</h2>
            <div className="price-table-container">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>宠物类别</th>
                    <th>宠物大小</th>
                    <th>每日价格</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price: any, index: number) => (
                    <tr key={price.priceId || index}>
                      <td>{price.petCategory || "-"}</td>
                      <td>{price.petSize || "-"}</td>
                      <td className="price-value">
                        ¥{price.pricePerDay || 0}/天
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;

