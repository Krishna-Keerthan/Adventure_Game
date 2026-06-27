json_structure = """
{
    "title": "Story Title",
    "rootNode": {
        "content": "The starting situation of the story",
        "isEnding": false,
        "isWinningEnding": false,
        "options": [
            {
                "text": "Option 1 text",
                "nextNode": {
                    "content": "What happens if the player picks option 1",
                    "isEnding": false,
                    "isWinningEnding": false,
                    "options": [
                        {
                            "text": "A deeper option",
                            "nextNode": {
                                "content": "The story ends here",
                                "isEnding": true,
                                "isWinningEnding": true,
                                "options": []
                            }
                        }
                    ]
                }
            },
            {
                "text": "Option 2 text",
                "nextNode": {
                    "content": "What happens if the player picks option 2",
                    "isEnding": true,
                    "isWinningEnding": false,
                    "options": []
                }
            }
        ]
    }
}
"""

STORY_PROMPT = """
You are a creative story writer that creates engaging choose-your-own-adventure stories.
Generate a complete branching story with multiple paths and endings.

The story should have:
1. A compelling title
2. A starting situation (root node) with 2-3 options
3. Each option leads to another node with its own options
4. Some paths lead to endings (both winning and losing)
5. At least one path leads to a winning ending

Story structure requirements:
- Each non-ending node must have 2-3 options
- The story must be 3-4 levels deep (including root node)
- Add variety in path lengths (some end earlier, some later)
- Ending nodes must have an empty options array: []

You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no code fences.
The JSON must follow this EXACT structure and field names:

{json_structure}

Rules for the JSON fields:
- "title": string — the story title
- "content": string — what happens at this point in the story
- "isEnding": boolean — true only if this node is a story ending
- "isWinningEnding": boolean — true only if this is a winning ending, false otherwise
- "options": array — list of choices; MUST be empty [] on ending nodes
- "text": string — the choice text shown to the player
- "nextNode": object — the next story node (same structure as rootNode)

Respond with the JSON object only. Do not wrap it in markdown or add any other text.
"""