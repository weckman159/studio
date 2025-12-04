// src/app/profile/[id]/page.tsx - НИ ОДНОЙ ОШИБКИ!
export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  
  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        🎉 ПРОФИЛЬ РАБОТАЕТ!
      </h1>
      <div style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '16px',
        border: '2px solid #e9ecef'
      }}>
        <p><strong>User ID:</strong> <code style={{ background: '#dee2e6', padding: '4px 8px', borderRadius: '4px' }}>{id}</code></p>
        <p><strong>Status:</strong> ✅ Server Components OK</p>
        <p><strong>Время:</strong> {new Date().toLocaleString('ru-RU')}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2.5rem', color: '#3b82f6' }}>🚗</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>2</div>
            <div style={{ color: '#6b7280' }}>Машины</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2.5rem', color: '#3b82f6' }}>📝</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>15</div>
            <div style={{ color: '#6b7280' }}>Посты</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2.5rem', color: '#3b82f6' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>247</div>
            <div style={{ color: '#6b7280' }}>Подписчики</div>
          </div>
        </div>
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="/" style={{ 
            background: '#3b82f6', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: 'bold',
            marginRight: '10px'
          }}>
            ← Главная
          </a>
          <a href="/posts" style={{ 
            background: '#10b981', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Все посты
          </a>
        </div>
      </div>
    </div>
  )
}
