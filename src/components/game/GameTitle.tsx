import type { GameText } from './types'

/**
 * The title screen text and Play button. Shared by the loader (before the game code
 * arrives) and the live game (over the moving sea), so the swap is seamless.
 */
export function GameTitle({
  text,
  onPlay,
  busy = false,
  onIntent,
}: {
  text: GameText
  onPlay: () => void
  busy?: boolean
  onIntent?: () => void
}) {
  return (
    <div className="game-title">
      <p className="kicker">{text.kicker}</p>
      <h3>
        {text.titleLead}
        <span>{text.titleHighlight}</span>
      </h3>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onPlay}
        onPointerEnter={onIntent}
        onFocus={onIntent}
        disabled={busy}
      >
        {busy ? text.loading : text.play}
      </button>
    </div>
  )
}
