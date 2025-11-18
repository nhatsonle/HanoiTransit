import SearchForm from '../components/SearchForm';
import NearbyStops from '../components/NearbyStops';
import { useNavigate } from 'react-router-dom';

const FEATURE_CARDS = [
  {
    title: 'Tìm chuyến đi tối ưu',
    description: 'So sánh nhanh lộ trình nhanh nhất, ít chuyển tuyến và chi phí tiết kiệm.',
  },
  {
    title: 'Chi tiết từng bước',
    description: 'Xem bản đồ, hướng dẫn di chuyển, trạng thái trễ/chậm theo thời gian thực.',
  },
  {
    title: 'Lưu và đồng bộ',
    description: 'Đăng nhập để lưu lộ trình yêu thích và đồng bộ giữa các thiết bị.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleSearch = ({ from, to }) => {
    navigate('/results', { state: { from, to } });
  };

  const handleNearbySelect = ({ stop, origin }) => {
    navigate('/results', {
      state: {
        from: { label: 'Vị trí của tôi', coords: origin },
        to: { label: stop.name, coords: stop.coords },
      },
    });
  };

  return (
    <div className="page home-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Lộ trình tàu & xe buýt giả lập</p>
          <h1>Định tuyến dễ dàng, tối ưu từng hành trình.</h1>
          <p className="lead">
            Ứng dụng giúp bạn tìm tuyến công cộng nhanh nhất, ít lần chuyển nhất hoặc tiết kiệm nhất dựa trên dữ liệu địa phương.
          </p>
        </div>
        <SearchForm onSubmit={handleSearch} />
      </section>

      <section className="feature-grid">
        {FEATURE_CARDS.map((card) => (
          <article key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <NearbyStops onSelectStop={handleNearbySelect} />
    </div>
  );
}

