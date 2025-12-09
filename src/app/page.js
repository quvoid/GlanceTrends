import Feed from '@/components/Feed';

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="container">
          <h1 className="logo">SEKILAS GLANCE</h1>
        </div>
      </header>

      <div className="container">
        <Feed />
      </div>
    </main>
  );
}
