import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./home.scss";

// 导入背景图片
const homeBgImage = new URL("../img/home.png", import.meta.url).href;

/**
 * 首页组件
 */
const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToStores = () => {
    navigate("/stores");
  };

  return (
    <div className="home-container">
      {/* 顶部导航栏 - 使用公共 Header 组件 */}
      <Header />

      {/* Hero 区域 */}
      <section 
        className="hero-section"
        style={{ backgroundImage: `url(${homeBgImage})` }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">家庭式宠物寄宿</h1>
            <p className="hero-subtitle">
              联系宠物父母和附近的家庭式宠物寄宿
            </p>
            <button className="hero-button" onClick={handleGoToStores}>
              我现在需要宠物寄宿
            </button>
          </div>
        </div>
      </section>

      {/* 内容区域 */}
      <section className="content-section">
        <div className="content-wrapper">
          {/* 左侧：服务描述和评价 */}
          <div className="content-left">
            <h2 className="content-title">
              成千上万的家庭式宠物寄养。成千上万的快乐宠物。
            </h2>
            <p className="content-description">
              与宠物酒店类似，但提供24小时护理、家常饭菜、游戏空间，甚至游泳池。
              让您的宠物有在家的感觉。查看评价。
            </p>

            {/* 客户评价 */}
            <div className="testimonials">
              <div className="testimonial-item">
                <div className="testimonial-avatar">👩</div>
                <div className="testimonial-content">
                  <div className="testimonial-location">London 狗寄宿</div>
                  <div className="testimonial-author">Ching:</div>
                  <div className="testimonial-text">我三只狗的好保姆</div>
                </div>
              </div>

              <div className="testimonial-item">
                <div className="testimonial-avatar">👨</div>
                <div className="testimonial-content">
                  <div className="testimonial-location">Australia 狗寄宿</div>
                  <div className="testimonial-author">Hughby:</div>
                  <div className="testimonial-text">
                    超级巨星，对待我的狗像对待自己的一样
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：价格信息 */}
          <div className="content-right">
            <h3 className="price-title">价格</h3>
            <div className="price-amount">
              <span className="price-currency">从</span>
              <span className="price-value">¥150</span>
              <span className="price-unit">/晚上</span>
            </div>

            <ul className="price-features">
              <li>全天候个人照顾</li>
              <li>一次少数宠物及无笼</li>
              <li>每日照片更新</li>
            </ul>

            <button className="quote-button">获取5个最近的报价</button>
          </div>
        </div>
      </section>

      {/* PetBacker 预订保障区域 */}
      <section className="petbacker-section">
        <div className="petbacker-wrapper">
          <h2 className="petbacker-title">通过 PetBoarding 预订</h2>
          
          <div className="petbacker-features">
            {/* 第一行 */}
            <div className="feature-item">
              <h3 className="feature-title">预订保障</h3>
              <p className="feature-description">
                若您所选择的宠物保姆、遛狗者或美容师临时取消了工作,我们将协助您尽快寻找到新的宠物保姆、遛狗者或美容师。
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">支付保障</h3>
              <p className="feature-description">
                工作未完成以前,您的可退款款项将存于 PetBoarding 钱包内,直到工作结束之后才会将款项拨给宠物保姆。
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">免费保险</h3>
              <p className="feature-description">
                宠物的安全,是我们的首要顾虑。凡是通过 PetBoarding 付款的使用者都将享有免费的高级保险。
              </p>
            </div>

            {/* 第二行 */}
            <div className="feature-item">
              <h3 className="feature-title">24小时客服</h3>
              <p className="feature-description">
                我们的团队将24小时为您守候,以防发生紧急状况(例如:生病或发生意外)时能即刻联系我们。
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">顶级服务品质</h3>
              <p className="feature-description">
                所有 PetBoarding 的服务都附有【透明式】评论机制以确保您所翻阅的客户评论都是真实的。这也是为了鼓励宠物保姆持续的提供更好的服务。
              </p>
            </div>

            <div className="feature-item">
              <h3 className="feature-title">特许奖励</h3>
              <p className="feature-description">
                每一笔在 PetBoarding 平台上的消费都将享有 PetBoarding 所提供的折扣硬币。
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
