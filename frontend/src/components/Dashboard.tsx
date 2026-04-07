import { mockUser } from "../mocks/userMock";
import { mockChats } from "../mocks/chatMock";
import { mockGames } from "../mocks/gameMock";

export const Dashboard = () => (
  <div>
    <h2>Bienvenido, {mockUser.displayName}</h2>
    <h3>Chats</h3>
    <ul>{mockChats.map(c => <li key={c.id}>{c.message}</li>)}</ul>
    <h3>Partidas</h3>
    <ul>{mockGames.map(g => <li key={g.id}>{g.player1.username} vs {g.player2.username}</li>)}</ul>
  </div>
);