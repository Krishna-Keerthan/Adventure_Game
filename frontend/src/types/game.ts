export interface CurrentNode {
  node_id: number
  content: string
  is_ending: boolean
  is_winning_ending: boolean
  options: { text: string; node_id: number }[]
}

export interface GameSession {
  id: number
  story_id: number
  story_title: string
  status: "in-progress" | "win" | "lost"
  started_at: string
  completed_at: string | null
  current_node: CurrentNode
}

export interface GameSessionSummary {
  id: number
  story_id: number
  story_title: string
  status: "in-progress" | "win" | "lost"
  started_at: string
  completed_at: string | null
}

export interface ChooseOptionRequest {
  option_index: number
}