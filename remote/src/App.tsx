import './App.css';

function App() {
  return (
    <main className="app">
      <section className="remote">
        <header className="remote__header">
          <h1>BGPads Remote</h1>
          <p>Remote control for BGPads Desktop</p>
        </header>

        <div className="remote__status">
          <span className="remote__status-indicator" />
          <span>Disconnected</span>
        </div>
      </section>
    </main>
  );
}

export default App;
