export interface StoryOption {
    text: string
    node_id: string
}

export interface StoryNode {
    id: number
    content: string
    is_ending: boolean
    is_winning_ending: boolean
    options: StoryOption[]
}

export interface Story {
    id: number
    title: string
    session_id: string
    created_at: string
    root_node: StoryNode
    all_nodes: Record<string, StoryNode>
}

export interface CreateStoryRequest {
    theme: string
}

export interface StoryJob {
    job_id: string
    status: "Pending" | "processing" | "completed" | "failed"
    created_at: string
    story_id: number | null
    completed_at: string | null
    error: string | null
}
