import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Tabs, Pagination, message, Spin, Empty } from "antd";
import Header from "../components/Header";
import { searchStores, StoreInfo, getAvatarUrl } from "../services/api";
import { getLongitude, getLatitude } from "../utils/auth";
import "./storeList.scss";

const { Search } = Input;

// 默认门店头像
const DEFAULT_STORE_AVATAR = new URL("../img/defult.png", import.meta.url).href;

// 默认用户头像
const DEFAULT_USER_AVATAR = new URL("../img/defult.png", import.meta.url).href;
// 评论接口
interface Review {
  rating: number;
  userAvatarUrl?: string;
  username?: string;
  [key: string]: any;
}

/**
 * 格式化距离显示
 * @param distance 距离（公里，后端返回）
 * @returns 格式化后的距离字符串
 */
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * 扩展门店信息接口，包含距离
 */
interface StoreInfoWithDistance extends StoreInfo {
  distance?: number;
}

/**
 * 寄宿店列表页面
 */
const StoreList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("recommended");
  const [storeList, setStoreList] = useState<StoreInfoWithDistance[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 标签页配置
  const tabItems = [
    { key: "recommended", label: "推荐" },
    { key: "nearby", label: "附近" },
    { key: "price", label: "价格" },
    { key: "hours", label: "营业时间" },
  ];

  // 加载门店列表
  const loadStores = async (keyword?: string, tab?: string) => {
    setLoading(true);
    try {
      const longitude = getLongitude();
      const latitude = getLatitude();

      // 根据标签页设置不同的搜索参数
      let searchOptions: {
        isActive?: number;
        latitude?: number;
        longitude?: number;
      } = {};

      if (tab === "nearby" && longitude && latitude) {
        // 附近：使用位置信息
        searchOptions = {
          latitude,
          longitude,
        };
      } else if (tab === "price") {
        // 价格：可以按价格排序（后端可能需要支持）
        // 暂时只搜索营业中的门店
        searchOptions = {
          isActive: 1,
        };
      } else if (tab === "hours") {
        // 营业时间：只显示营业中的门店
        searchOptions = {
          isActive: 1,
        };
      } else {
        // 推荐：默认显示所有门店
        searchOptions = {
          isActive: 1,
        };
      }

      // 如果有位置信息，添加到搜索选项中
      if (longitude && latitude && tab !== "nearby") {
        searchOptions.latitude = latitude;
        searchOptions.longitude = longitude;
      }

      const stores = await searchStores(keyword, searchOptions);
      
      // 后端已经返回了 distance 字段，直接使用
      let storesWithDistance: StoreInfoWithDistance[] = stores.map((store) => ({
        ...store,
        distance: (store as any).distance, // 使用后端返回的距离
      }));

      // 如果是"附近"标签页，按距离排序
      if (tab === "nearby") {
        storesWithDistance = storesWithDistance.sort((a, b) => {
          if (a.distance === undefined || a.distance === null) return 1;
          if (b.distance === undefined || b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }

      setStoreList(storesWithDistance);
      setTotal(storesWithDistance.length);
    } catch (error: any) {
      console.error("加载门店列表失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "加载门店列表失败，请稍后重试";
      message.error(errorMsg);
      setStoreList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadStores("", activeTab);
  }, [activeTab]);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
    loadStores(value, activeTab);
  };

  // 标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
    loadStores(searchKeyword, key);
  };

  // 分页变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // 获取当前页的数据
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return storeList.slice(start, end);
  };

  // 渲染评分星星
  const renderStars = (rating: number = 5) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? "filled" : "empty"}`}
        >
          ★
        </span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  // 渲染服务选项（使用后端返回的 reviews 数据）
  const renderServiceOptions = (store: StoreInfoWithDistance) => {
    const reviews = (store as any).reviews as Review[] | undefined;
    
    // 如果没有评论数据，不显示
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return null;
    }

    return (
      <div className="service-options">
        {reviews.map((review, index) => (
          <div key={index} className="service-option">
            <img
              src={
                review.userAvatarUrl
                  ? getAvatarUrl(review.userAvatarUrl, "user")
                  : DEFAULT_USER_AVATAR
              }
              alt={review.username || "用户"}
              className="service-user-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
              }}
            />
            <span className="service-username">
              {review.username || "匿名用户"}
            </span>
            {renderStars(review.rating || 0)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="store-list-container">
      <Header />
      <div className="store-list-content">
        {/* 搜索和操作区域 */}
        <div className="search-section">
          <Search
            placeholder="搜索门店名称或地址"
            allowClear
            enterButton={<Button type="primary">搜索</Button>}
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ maxWidth: "800px", width: "100%" }}
          />
        </div>

        {/* 标签页 */}
        <div className="tabs-section">
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={handleTabChange}
            className="store-tabs"
          />
        </div>

        {/* 门店列表 */}
        <div className="stores-section">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : storeList.length === 0 ? (
            <Empty description="暂无门店数据" />
          ) : (
            <div className="stores-grid">
              {getCurrentPageData().map((store) => (
                <div
                  key={store.storeId}
                  className="store-card"
                  onClick={() => {
                    if (store.storeId) {
                      navigate(`/stores/${store.storeId}`);
                    }
                  }}
                >
                    <div className="store-card-image">
                      <img
                        src={
                          (store as any).avatarUrl
                            ? getAvatarUrl((store as any).avatarUrl, "store")
                            : DEFAULT_STORE_AVATAR
                        }
                        alt={store.name || "门店"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            DEFAULT_STORE_AVATAR;
                        }}
                      />
                    </div>
                    <div className="store-card-content">
                      <div className="store-card-header">
                        <div className="store-header-left">
                          <h3 className="store-name">
                            {store.name || "未命名门店"}
                          </h3>
                          {typeof store.distance === 'number' && (
                            <span className="store-distance">
                              {formatDistance(store.distance)}
                            </span>
                          )}
                        </div>
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
                      <p className="store-description">
                        {(store as any).description ||
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                      </p>
                      {renderServiceOptions(store)}
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {!loading && storeList.length > 0 && (
          <div className="pagination-section">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
              pageSizeOptions={["10", "20", "50", "100"]}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreList;

