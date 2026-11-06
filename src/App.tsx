// =======================================================================
//  LỚP HỌC CHỮ - APP ENTRYPOINT
//  Admin Workspace Architecture & Neo-Brutalism Design by GumballZ
// =======================================================================
import { IS_STAGE } from './live/page';
import { StageFrame } from './live/StageFrame';
import { Dashboard } from './live/Dashboard';
import { useGame } from './game/useGame';
import { GameStage } from './game/GameStage';
import { GameControls } from './game/GameControls';

export default function App() {
  const game = useGame();

  // Trang cho TikTok LIVE Studio: chỉ có màn hình game 1080x1920
  if (IS_STAGE) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <StageFrame>
          <GameStage game={game} />
        </StageFrame>
      </div>
    );
  }

  // Trang điều khiển Admin: Neo-Brutalism Ocean Breeze giao diện thiết kế bởi GumballZ
  return (
    <Dashboard
      status={game.status}
      channelName={game.channelName}
      view={game.view}
      stageCount={game.stageCount}
      preview={
        <StageFrame maxHeight={window.innerHeight - 150}>
          <GameStage game={game} />
        </StageFrame>
      }
      extra={<GameControls view={game.view} stageCount={game.stageCount} />}
    />
  );
}
